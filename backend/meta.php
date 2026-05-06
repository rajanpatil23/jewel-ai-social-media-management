<?php
// Meta Graph helpers — OAuth + publish + insights.
// Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
//       https://developers.facebook.com/docs/pages/publishing/
// Requires App Review for production: pages_manage_posts, pages_read_engagement,
// pages_show_list, instagram_basic, instagram_content_publish, instagram_manage_insights.

const META_GRAPH = 'https://graph.facebook.com/v19.0';

function meta_http(string $method, string $url, array $params = [], ?string $body = null): array {
    if ($method === 'GET' && $params) {
        $url .= (strpos($url,'?')===false?'?':'&') . http_build_query($params);
    }
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_CUSTOMREQUEST  => $method,
    ];
    if ($method !== 'GET') {
        $opts[CURLOPT_POSTFIELDS] = $body !== null ? $body : http_build_query($params);
        $opts[CURLOPT_HTTPHEADER] = ['Content-Type: application/x-www-form-urlencoded'];
    }
    curl_setopt_array($ch, $opts);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode($resp, true) ?: [];
    if ($code >= 400) {
        $msg = $data['error']['message'] ?? "graph_$code";
        throw new RuntimeException($msg);
    }
    return $data;
}

// Step 1: build OAuth URL the browser is sent to
function meta_oauth_url(string $state): string {
    $c = cfg();
    $scopes = implode(',', [
        'public_profile','email',
        'pages_show_list','pages_manage_posts','pages_read_engagement',
        'instagram_basic','instagram_content_publish','instagram_manage_insights',
        'business_management',
    ]);
    return 'https://www.facebook.com/v19.0/dialog/oauth?' . http_build_query([
        'client_id'     => $c['meta_app_id'],
        'redirect_uri'  => $c['meta_redirect_uri'],
        'response_type' => 'code',
        'scope'         => $scopes,
        'state'         => $state,
    ]);
}

// Step 2: exchange code → short-lived → long-lived (60-day) token
function meta_exchange_code(string $code): array {
    $c = cfg();
    $short = meta_http('GET', META_GRAPH . '/oauth/access_token', [
        'client_id'     => $c['meta_app_id'],
        'client_secret' => $c['meta_app_secret'],
        'redirect_uri'  => $c['meta_redirect_uri'],
        'code'          => $code,
    ]);
    $long = meta_http('GET', META_GRAPH . '/oauth/access_token', [
        'grant_type'        => 'fb_exchange_token',
        'client_id'         => $c['meta_app_id'],
        'client_secret'     => $c['meta_app_secret'],
        'fb_exchange_token' => $short['access_token'],
    ]);
    return $long; // ['access_token' => ..., 'expires_in' => seconds]
}

// Pull pages + linked IG accounts. Page tokens never expire as long as user token is valid.
function meta_fetch_assets(string $userToken): array {
    $me   = meta_http('GET', META_GRAPH . '/me', ['fields' => 'id,name', 'access_token' => $userToken]);
    $pages= meta_http('GET', META_GRAPH . '/me/accounts',
            ['fields' => 'id,name,access_token,instagram_business_account{id,username}', 'access_token' => $userToken]);
    return ['user' => $me, 'pages' => $pages['data'] ?? []];
}

// Publish a Facebook Page photo (or text-only feed post)
function meta_publish_facebook(string $pageId, string $pageToken, ?string $imageUrl, string $caption): string {
    if ($imageUrl) {
        $r = meta_http('POST', META_GRAPH . "/$pageId/photos", [
            'url' => $imageUrl, 'caption' => $caption, 'access_token' => $pageToken,
        ]);
        return $r['post_id'] ?? ($r['id'] ?? '');
    }
    $r = meta_http('POST', META_GRAPH . "/$pageId/feed", [
        'message' => $caption, 'access_token' => $pageToken,
    ]);
    return $r['id'] ?? '';
}

// Publish single image to Instagram (2-step). $imageUrl must be public HTTPS.
function meta_publish_instagram(string $igUserId, string $pageToken, string $imageUrl, string $caption): string {
    $container = meta_http('POST', META_GRAPH . "/$igUserId/media", [
        'image_url'    => $imageUrl,
        'caption'      => $caption,
        'access_token' => $pageToken,
    ]);
    $cid = $container['id'] ?? null;
    if (!$cid) throw new RuntimeException('ig_container_failed');
    return meta_publish_container($igUserId, $pageToken, $cid);
}

function meta_publish_container(string $igUserId, string $pageToken, string $creationId): string {
    // Poll status until FINISHED (esp. for reels/carousels)
    for ($i = 0; $i < 20; $i++) {
        try {
            $st = meta_http('GET', META_GRAPH . "/$creationId", [
                'fields' => 'status_code', 'access_token' => $pageToken,
            ]);
            if (($st['status_code'] ?? '') === 'FINISHED') break;
            if (($st['status_code'] ?? '') === 'ERROR') throw new RuntimeException('ig_container_error');
        } catch (Throwable $e) { /* keep polling */ }
        sleep(3);
    }
    $pub = meta_http('POST', META_GRAPH . "/$igUserId/media_publish", [
        'creation_id'  => $creationId,
        'access_token' => $pageToken,
    ]);
    return $pub['id'] ?? '';
}

// Publish carousel (2-10 images) to Instagram
function meta_publish_instagram_carousel(string $igUserId, string $pageToken, array $imageUrls, string $caption): string {
    $children = [];
    foreach ($imageUrls as $url) {
        $c = meta_http('POST', META_GRAPH . "/$igUserId/media", [
            'image_url'        => $url,
            'is_carousel_item' => 'true',
            'access_token'     => $pageToken,
        ]);
        if (empty($c['id'])) throw new RuntimeException('ig_carousel_child_failed');
        $children[] = $c['id'];
    }
    $container = meta_http('POST', META_GRAPH . "/$igUserId/media", [
        'media_type'   => 'CAROUSEL',
        'children'     => implode(',', $children),
        'caption'      => $caption,
        'access_token' => $pageToken,
    ]);
    $cid = $container['id'] ?? null;
    if (!$cid) throw new RuntimeException('ig_carousel_container_failed');
    return meta_publish_container($igUserId, $pageToken, $cid);
}

// Publish a Reel (video) to Instagram. $videoUrl must be public HTTPS MP4.
function meta_publish_instagram_reel(string $igUserId, string $pageToken, string $videoUrl, string $caption, bool $shareToFeed = true): string {
    $container = meta_http('POST', META_GRAPH . "/$igUserId/media", [
        'media_type'    => 'REELS',
        'video_url'     => $videoUrl,
        'caption'       => $caption,
        'share_to_feed' => $shareToFeed ? 'true' : 'false',
        'access_token'  => $pageToken,
    ]);
    $cid = $container['id'] ?? null;
    if (!$cid) throw new RuntimeException('ig_reel_container_failed');
    return meta_publish_container($igUserId, $pageToken, $cid);
}

// Publish a video to a Facebook Page
function meta_publish_facebook_video(string $pageId, string $pageToken, string $videoUrl, string $caption): string {
    $r = meta_http('POST', META_GRAPH . "/$pageId/videos", [
        'file_url'     => $videoUrl,
        'description'  => $caption,
        'access_token' => $pageToken,
    ]);
    return $r['id'] ?? '';
}

// Publish carousel to Facebook (multi-photo post)
function meta_publish_facebook_carousel(string $pageId, string $pageToken, array $imageUrls, string $caption): string {
    $mediaIds = [];
    foreach ($imageUrls as $url) {
        $u = meta_http('POST', META_GRAPH . "/$pageId/photos", [
            'url' => $url, 'published' => 'false', 'access_token' => $pageToken,
        ]);
        if (!empty($u['id'])) $mediaIds[] = $u['id'];
    }
    $attached = [];
    foreach ($mediaIds as $mid) $attached[] = ['media_fbid' => $mid];
    $r = meta_http('POST', META_GRAPH . "/$pageId/feed", [
        'message'           => $caption,
        'attached_media'    => json_encode($attached),
        'access_token'      => $pageToken,
    ]);
    return $r['id'] ?? '';
}

// Aggregate Page + IG insights for last N days
function meta_insights(string $pageId, string $pageToken, ?string $igUserId, int $days = 28): array {
    $since = strtotime("-$days days");
    $until = time();

    $page = meta_http('GET', META_GRAPH . "/$pageId/insights", [
        'metric'       => 'page_impressions,page_post_engagements,page_fans',
        'period'       => 'day',
        'since'        => $since,
        'until'        => $until,
        'access_token' => $pageToken,
    ]);

    $ig = null;
    if ($igUserId) {
        try {
            $ig = meta_http('GET', META_GRAPH . "/$igUserId/insights", [
                'metric'       => 'reach,impressions,profile_views',
                'period'       => 'day',
                'since'        => $since,
                'until'        => $until,
                'access_token' => $pageToken,
            ]);
        } catch (Throwable $e) { /* IG insights not available unless business */ }
    }
    return ['page' => $page, 'ig' => $ig];
}
