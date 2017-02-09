<?php
$path = $_GET['url'];
//TODO: make this safe from outside malicious attempts
readfile($path);
?>