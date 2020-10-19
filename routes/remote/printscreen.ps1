Param(
  [String]$target = 'active',
  [String]$command = 'jpg_pngocr.100.10.500.500'
)
# jpg_pngocr.100.10.500.500

Add-Type -AssemblyName System.Windows.Forms;

if($target -eq "active"){
  # Alt+PrintScreenを送信
  [Windows.Forms.Sendkeys]::SendWait("%{PrtSc}");
}else{
  [Windows.Forms.Sendkeys]::SendWait("{PrtSc}");
}
Start-Sleep -Milliseconds 250
[System.Drawing.Image]$clipboardImage = [Windows.Forms.Clipboard]::GetImage();
if ($null -ne $clipboardImage)
{
  [String]$fileName = (Get-Date).ToFileTime().ToString();
  [String]$outputFilePath = "public/remote/temp/" + $fileName + "_";
  [String]$ocr;
  [Array]$result = @();
  [Int]$index = 0;
  [array]$commandList = $command.split("_");
  $commandList | ForEach-Object -Process {
    [array]$cmndList = $_.split(".");
    [String]$exp = $cmndList[0].Substring(0, 3);
    [String]$fName = $outputFilePath + $index + "_printscreen." + $exp;
    if($exp -eq "jpg"){
      # 変数宣言を事前にすると、返り値にノイズが入る
      [System.Drawing.Imaging.ImageFormat]$encoder = [System.Drawing.Imaging.ImageFormat]::Jpeg;
    }else{
      [System.Drawing.Imaging.ImageFormat]$encoder = [System.Drawing.Imaging.ImageFormat]::Png;
    }
    if($cmndList.Length -gt 1){
      [Int]$x = ([Int]$cmndList[1] + $clipboardImage.Width)%$clipboardImage.Width;
      [Int]$y = ([Int]$cmndList[2] + $clipboardImage.Height)%$clipboardImage.Height;
      [Int]$w = [math]::min([Int]$cmndList[3], $clipboardImage.Width - $x);
      [Int]$h = [math]::min([Int]$cmndList[4], $clipboardImage.Height - $y);
      [System.Drawing.Rectangle]$rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h);
      $clipboardImage.Clone($rect, $clipboardImage.PixelFormat).Save($fName, $encoder);
    }else{
      # todo jpg時の圧縮率を指定できるように
      $clipboardImage.Save($fName, $encoder);
    }
    $result += $fName.Substring("public/remote/".Length);
    
    if($cmndList[0].Length -gt 3){
      [String]$op = $cmndList[0].Substring(3);
      if($op -eq "ocr"){
        # todo ファイルじゃなくてストリームで渡すように
        D:\inetpub\Tesseract-OCR\tesseract.exe $fName $fName -l jpn;
        $result += $fName.Substring("public/remote/".Length) + ".txt";
      }
    }
    
    $index ++;
  }
}

Write-Output $result;
# Write-Host ('printscreen,' + $target + ',' + $command);
