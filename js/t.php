<?php
//header('Content-Type: text/html; charset=windows-1251'); 

mb_internal_encoding('UTF-8'); 
mb_regex_encoding('UTF-8'); 

function mb_trim( $string, $chars = "", $chars_array = array() )
{
    for( $x=0; $x<iconv_strlen( $chars ); $x++ ) $chars_array[] = preg_quote( iconv_substr( $chars, $x, 1 ) );
    $encoded_char_list = implode( "|", array_merge( array( "\s","\t","\n","\r", "\0", "\x0B" ), $chars_array ) );

    $string = mb_ereg_replace( "^($encoded_char_list)*", "", $string );
    $string = mb_ereg_replace( "($encoded_char_list)*$", "", $string );
    return $string;
}

$f = file("word8.txt");

$out = "var dict = {\n";

$owords = array();

$letters = array();


foreach($f as $line){

	$line = mb_trim($line);
	if(mb_strlen($line)<1) continue;
	
	$first = mb_substr($line, 0, 1);
	if(!isset($owords[$first])) $owords[$first] = array();

	$words = explode(",", $line);

	foreach($words as $word){
		//if (mb_strlen($word)>5) continue;
		//if (mb_strpos($word, "'")) continue;
		
		$owords[$first][] = '"'.$word.'"';
	}
}


foreach($owords as $key => $oword){
	$out .= "'".$key."'";
	$out .= ": [";
	//sort($oword);
	$out .= join(",", $oword);
	$out .= "],\n";
}

$out.="}";
echo $out;