GCLogViewer
-----------

Currently the application only works in Firefox. There is a bug on Chrome, at 
least for Linux, with the drag and drop api. 
(https://code.google.com/p/chromium/issues/detail?id=168544)

The bug has been "unconfirmed" for 2 years so it doesn't look like Chrome will
fix it soon. I have tried workarounds using mouse down and mouse up events but 
this didn't work out.  It will probably require a re-implementation of the HTML 
drag and drop api, which, by the way is an abomination. This is something we
may try later.