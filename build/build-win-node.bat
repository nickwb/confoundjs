@echo off

SET CJSLIB=%~dp0..\lib
SET CJSSRC=%~dp0..\src
SET CJSOUT=%~dp0..

uglifyjs %CJSLIB%\promise.js^
 %CJSLIB%\uglify.js^
 %CJSLIB%\underscore.js^
 %CJSSRC%\numbers.js^
 %CJSSRC%\bitpack.js^
 %CJSSRC%\strings.js^
 %CJSSRC%\runtime.js^
 %CJSSRC%\sourcetransform.js^
 %CJSSRC%\api.js^
 -m -c^
 -o %CJSOUT%\confound.js