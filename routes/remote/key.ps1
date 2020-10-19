Add-Type -AssemblyName System.Windows.Forms;
Add-Type -AssemblyName System.Web;

if($null -ne $Args){
  $Args | ForEach-Object -Process {
    [String]$str = [System.Web.HttpUtility]::UrlDecode($_);
    [System.Windows.Forms.SendKeys]::SendWait($str);
    Start-Sleep -s 0.5
  }
}

Write-Output ('key,' + $Args);