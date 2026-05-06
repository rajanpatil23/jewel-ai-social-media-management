<?php
function ping($m) {
    json_out(['ok' => true, 'time' => date('c')]);
}
