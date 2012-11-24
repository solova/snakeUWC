<?php
header('Content-Type: text/html; charset=windows-1251'); 
$f = file("base.txt");

$out = "var dict = {\n";

$owords = array();

foreach($f as $line){

	$line = trim($line);
	if(strlen($line)<1) continue;
	
	$first = substr($line, 0, 1);
	if(!isset($owords[$first])) $owords[$first] = array();

	$words = explode(",", $line);

	foreach($words as $word){
		if (mb_strlen($word)>5) continue;
		if (mb_strpos($word, "'")) continue;
		$owords[$first][] = '"'.$word.'"';
	}
}

foreach($owords as $key => $oword){
	$out .= "'".$key."'";
	$out .= ": [";
	sort($oword);
	$out .= join(",", $oword);
	$out .= "],\n";
}

$out.="}";
echo $out;