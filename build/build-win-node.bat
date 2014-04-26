@echo off

SET CJSSRC=%~dp0..\src
SET CJSOUT=%~dp0..

browserify %CJSSRC%\browser.js^
 -o %CJSOUT%\confound.js