Write-Host "Copying Files to sp1-cpweb-01";
#Copy-Item -Path C:\inetpub\buildfile\assets\* -Destination \\st1-cpweb-01\c$\inetpub\wwwroot\terminus\assets\ -Recurse;
#Copy-Item -Path C:\inetpub\buildfile\clinicalsummary.js -Destination \\st1-cpweb-01\c$\inetpub\wwwroot\terminusmoduleloader\scripts\clinicalsummary\ -Recurse;



Write-Host "Copying Files to sd1-cpweb-01";
#Copy-Item -Path C:\inetpub\buildfile\assets\* -Destination \\st1-cpweb-02\c$\inetpub\wwwroot\terminus\assets\ -Recurse;
#Copy-Item -Path C:\inetpub\buildfile\clinicalsummary.js -Destination \\st1-cpweb-02\c$\inetpub\wwwroot\terminusmoduleloader\scripts\clinicalsummary\ -Recurse;


#Write-Host "Removing files from buildfiles";
#Get-ChildItem C:\inetpub\buildfile\ -Include *.* -Recurse | ForEach  { $_.Delete()};
#Get-ChildItem C:\inetpub\buildfile\ | ForEach   { $_.Delete()};