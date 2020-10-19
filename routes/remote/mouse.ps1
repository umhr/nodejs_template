Param(
  $btnpos,
  [String]$mouseEvent,
  $x,
  $y
)

# http://blog.livedoor.jp/morituri/archives/53399411.html
# C#のソースコードを変数に保存
$src = @"
using System;
using System.Runtime.InteropServices;
 
namespace Win32Api {

  public struct RECT {
    public int left;
    public int top;
    public int right;
    public int bottom;
  }
 
  public class Helper {

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetWindowRect(IntPtr hwnd, out RECT lpRect);
   
    public static RECT GetForegroundWindowRect() {
      IntPtr hwnd = GetForegroundWindow();
      RECT rect = new RECT();
      GetWindowRect(hwnd, out rect);
     
      return rect;
    }
  }
}
"@

# ソースコードからセッションにクラスを追加
Add-Type -TypeDefinition $src
<#
# 頭にaが付いている場合は、アクティブなウィンドウからの相対座標として処理をする。
# 操作側でdesktop/activeを変更しても、画面キャプチャが未取得の場合や、
# 別ウィンドウが開いた場合などに、
# 意図と異なる座標として処理をする可能性がある。
# この問題を回避するには、画面キャプチャ時点でのアクティブウィンドウの座標を返して、
# 画面キャプチャの表示、操作時点で、絶対座標として投げるのが良い。
# しかし、返り値周りの処理が複雑になるので、未実装。
#>

# .NETのCursorクラスを利用するためにSystem.Windows.Formsをロード
add-type -AssemblyName System.Windows.Forms;
if($null -ne $x -and $null -ne $y){
  if($x.subString(0,1) -eq "a"){
    $x = [Int]$x.subString(1);
    $y = [Int]$y.subString(1);
    $rect = [Win32Api.Helper]::GetForegroundWindowRect();
    $x += $rect.left;
    $y += $rect.top;
  }
  # CursorクラスのPositionプロパティにマウス座標を設定
  [System.Windows.Forms.Cursor]::Position = new-object System.Drawing.Point($x, $y);
}

# https://www.inasoft.org/talk/h202005a.html
function Click-MouseButton
{
    $signature=@' 
      [DllImport("user32.dll",CharSet=CharSet.Auto, CallingConvention=CallingConvention.StdCall)]
      public static extern void mouse_event(long dwFlags, long dx, long dy, long cButtons, long dwExtraInfo);
'@ 

    $SendMouseClick = Add-Type -memberDefinition $signature -name "Win32MouseEventNew" -namespace Win32Functions -passThru;

    if($btnpos -eq "left"){
      # left
      if($mouseEvent -eq "down"){
        $SendMouseClick::mouse_event(0x00000002, 0, 0, 0, 0);
      } elseif ($mouseEvent -eq "up") {
        $SendMouseClick::mouse_event(0x00000004, 0, 0, 0, 0);
      } else{
        $SendMouseClick::mouse_event(0x00000002, 0, 0, 0, 0);
        $SendMouseClick::mouse_event(0x00000004, 0, 0, 0, 0);
      }
    } elseif ($btnpos -eq "middle") {
      # middle
      if($mouseEvent -eq "down"){
        $SendMouseClick::mouse_event(0x00000020, 0, 0, 0, 0);
      } elseif ($mouseEvent -eq "up") {
        $SendMouseClick::mouse_event(0x00000040, 0, 0, 0, 0);      
      } else{
        $SendMouseClick::mouse_event(0x00000020, 0, 0, 0, 0);
        $SendMouseClick::mouse_event(0x00000040, 0, 0, 0, 0);      
      }
    } elseif ($btnpos -eq "right") {
      # right
      if($mouseEvent -eq "down"){
        $SendMouseClick::mouse_event(0x00000008, 0, 0, 0, 0);
      } elseif ($mouseEvent -eq "up") {
        $SendMouseClick::mouse_event(0x00000010, 0, 0, 0, 0);      
      } else{
        $SendMouseClick::mouse_event(0x00000008, 0, 0, 0, 0);
        $SendMouseClick::mouse_event(0x00000010, 0, 0, 0, 0);      
      }
    }
}

if($null -ne $btnpos){
  Click-MouseButton;
}

Write-Output ('mouse,' + $btnpos + ',' + $mouseEvent + ',' + $x + ',' + $y);

