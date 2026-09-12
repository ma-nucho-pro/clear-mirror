param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\assets\clear-mirror-social.png')
)

Add-Type -AssemblyName System.Drawing

function New-RoundedPath {
  param([System.Drawing.RectangleF]$Rectangle, [float]$Radius)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $Radius * 2
  $path.AddArc($Rectangle.X, $Rectangle.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rectangle.X, $Rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-CenteredText {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush,
    [System.Drawing.RectangleF]$Bounds
  )
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $Graphics.DrawString($Text, $Font, $Brush, $Bounds, $format)
  $format.Dispose()
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = [System.IO.Path]::GetDirectoryName($resolvedOutput)
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$width = 1600
$height = 900
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.PointF]::new(0, 0),
  [System.Drawing.PointF]::new($width, $height),
  [System.Drawing.Color]::FromArgb(255, 2, 6, 23),
  [System.Drawing.Color]::FromArgb(255, 17, 24, 39)
)
$graphics.FillRectangle($background, 0, 0, $width, $height)
$background.Dispose()

$glowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 37, 99, 235))
$graphics.FillEllipse($glowBrush, 1050, -140, 570, 570)
$graphics.FillEllipse($glowBrush, -190, 610, 570, 570)
$glowBrush.Dispose()

$linePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180, 30, 58, 138), 2)
$graphics.DrawLine($linePen, 80, 165, 1520, 165)
$graphics.DrawLine($linePen, 80, 730, 1520, 730)
$linePen.Dispose()

$dark = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 3, 7, 18))
$blue = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 37, 99, 235))
$lightBlue = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 96, 165, 250))
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
$faint = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$cardBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(230, 15, 23, 42))
$cardPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 59, 130, 246), 3)

$iconRect = [System.Drawing.RectangleF]::new(120, 92, 180, 180)
$iconPath = New-RoundedPath $iconRect 48
$graphics.FillPath($dark, $iconPath)
$graphics.DrawPath($cardPen, $iconPath)
$iconPath.Dispose()
$graphics.FillEllipse($cardBrush, 165, 117, 90, 90)
$graphics.DrawEllipse($cardPen, 165, 117, 90, 90)
$graphics.FillPie($blue, 165, 117, 90, 90, -90, 180)
$graphics.FillPolygon($white, @(
  [System.Drawing.PointF]::new(235, 146),
  [System.Drawing.PointF]::new(213, 201),
  [System.Drawing.PointF]::new(191, 146),
  [System.Drawing.PointF]::new(213, 157)
))
$rayPen = [System.Drawing.Pen]::new($lightBlue, 7)
$rayPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$rayPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($rayPen, 210, 112, 210, 95)
$graphics.DrawLine($rayPen, 210, 212, 210, 229)
$graphics.DrawLine($rayPen, 160, 162, 143, 162)
$graphics.DrawLine($rayPen, 260, 162, 277, 162)
$rayPen.Dispose()

$titleFont = [System.Drawing.Font]::new('Segoe UI', 84, [System.Drawing.FontStyle]::Bold)
$subtitleFont = [System.Drawing.Font]::new('Segoe UI', 30, [System.Drawing.FontStyle]::Regular)
$heroFont = [System.Drawing.Font]::new('Segoe UI', 32, [System.Drawing.FontStyle]::Bold)
$cardNumberFont = [System.Drawing.Font]::new('Segoe UI', 25, [System.Drawing.FontStyle]::Bold)
$cardTitleFont = [System.Drawing.Font]::new('Segoe UI', 36, [System.Drawing.FontStyle]::Bold)
$cardTextFont = [System.Drawing.Font]::new('Segoe UI', 22, [System.Drawing.FontStyle]::Regular)
$footerFont = [System.Drawing.Font]::new('Segoe UI', 26, [System.Drawing.FontStyle]::Regular)

$graphics.DrawString('CLEAR', $titleFont, $white, 345, 105)
$graphics.DrawString('MIRROR', $titleFont, $lightBlue, 690, 105)
$graphics.DrawString('A CLEAR-EYED ADVISOR FOR AI AGENTS', $subtitleFont, $lightBlue, 350, 205)
Draw-CenteredText $graphics 'Challenge assumptions. Expose blind spots. Leave with a plan.' $heroFont $muted ([System.Drawing.RectangleF]::new(100, 300, 1400, 65))

function Draw-Card {
  param([float]$X, [string]$Number, [string]$Heading, [string]$Body, [System.Drawing.Pen]$Pen)
  $rect = [System.Drawing.RectangleF]::new($X, 470, 380, 170)
  $path = New-RoundedPath $rect 24
  $graphics.FillPath($cardBrush, $path)
  $graphics.DrawPath($Pen, $path)
  $path.Dispose()
  $graphics.DrawString($Number, $cardNumberFont, $lightBlue, $X + 34, 500)
  $graphics.DrawString($Heading, $cardTitleFont, $white, $X + 34, 545)
  $graphics.DrawString($Body, $cardTextFont, $muted, $X + 34, 590)
}

Draw-Card 140 '01' 'REMEMBER' 'context, facts, constraints' $cardPen
Draw-Card 610 '02' 'CREATE' 'intent, tools, useful output' $cardPen
Draw-Card 1080 '03' 'VERIFY' 'evidence, risks, next step' $cardPen

$arrowPen = [System.Drawing.Pen]::new($lightBlue, 4)
$arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
foreach($x in @(550, 1020)) {
  $graphics.DrawLine($arrowPen, $x, 555, $x + 75, 555)
  $graphics.DrawLine($arrowPen, $x + 65, 545, $x + 82, 555)
  $graphics.DrawLine($arrowPen, $x + 65, 565, $x + 82, 555)
}
$arrowPen.Dispose()

Draw-CenteredText $graphics 'DIRECT FEEDBACK  |  STRATEGIC CLARITY  |  CONCRETE ACTION' $footerFont $faint ([System.Drawing.RectangleF]::new(150, 765, 1300, 50))

$bitmap.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
$footerFont.Dispose()
$cardTextFont.Dispose()
$cardTitleFont.Dispose()
$cardNumberFont.Dispose()
$heroFont.Dispose()
$subtitleFont.Dispose()
$titleFont.Dispose()
$cardPen.Dispose()
$dark.Dispose()
$blue.Dispose()
$lightBlue.Dispose()
$white.Dispose()
$muted.Dispose()
$faint.Dispose()
$cardBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output "Rendered $resolvedOutput"
