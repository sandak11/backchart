/*********************************************************************************
*     File Name           :     main.js
*     Created By          :     Jone Casper(xu.chenhui@live.com)
*     Creation Date       :     [2014-03-25 22:59]
*     Last Modified       :     [2014-04-06 05:16]
*     Description         :     The entry point for backchart.utils
**********************************************************************************/

define([
    "./codepage/cptable",
    "./codepage/cputils",
    "./jszip/jszip",
    "./parser",
    ], function(parser){
    return {
        parser: parser
    };
});
