$segmentDuration = 15  # Set segment duration in seconds

$files = Get-ChildItem -Path "./public/videos" -Filter "*.mp4" | Where-Object { $_.Name -notmatch "^cropped_" }

foreach ($file in $files) {
    # Get video metadata
    $metadata = & ffmpeg -i $file.FullName 2>&1 | Out-String
    
    Write-Host "Metadata Output:`n$metadata"

    # Extract duration
    $durationMatch = $metadata | Select-String "Duration: (\d{2}):(\d{2}):(\d{2})"
    if ($durationMatch) {
        $hours = [int]$durationMatch.Matches[0].Groups[1].Value
        $minutes = [int]$durationMatch.Matches[0].Groups[2].Value
        $seconds = [int]$durationMatch.Matches[0].Groups[3].Value
        $totalSeconds = ($hours * 3600) + ($minutes * 60) + $seconds
    }
    else {
        Write-Host "Skipping $($file.Name): Unable to determine duration."
        continue
    }

    # Ensure video is longer than segment duration
    if ($totalSeconds -lt $segmentDuration) {
        Write-Host "Skipping $($file.Name): Video is shorter than $segmentDuration seconds."
        continue
    }

    # Extract resolution
    $resolutionMatch = $metadata | Select-String "Stream.*Video:.* (\d{2,5})x(\d{2,5})"
    if ($resolutionMatch) {
        $width = [int]$resolutionMatch.Matches[0].Groups[1].Value
        $height = [int]$resolutionMatch.Matches[0].Groups[2].Value
    }
    else {
        Write-Host "Skipping $($file.Name): Unable to determine resolution."
        continue
    }

    # Determine cropping parameters for 9:18 aspect ratio
    if ($width -gt $height) {
        # Landscape video - crop width
        $newWidth = [math]::Floor($height / 2)   # 9:18 -> width = height / 2
        $cropFilter = "crop=${newWidth}:${height}:(in_w-$newWidth)/2:0"
    }
    else {
        # Portrait video - crop height
        $newHeight = [math]::Floor($width * 2)  # 9:18 -> height = width * 2
        $cropFilter = "crop=${width}:$newHeight:0:(in_h-$newHeight)/2"
    }
    
    Write-Host "Applying Crop: $cropFilter"

    # Pick a random segment
    $maxStart = $totalSeconds - $segmentDuration
    $randomStart = if ($maxStart -gt 0) { Get-Random -Minimum 0 -Maximum $maxStart } else { 0 }

    # Append timestamp to output file name
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"    
    $output = Join-Path -Path $file.DirectoryName -ChildPath ("cropped_" + $file.BaseName + "_" + $timestamp + $file.Extension)

    # Print out all the information
    Write-Host "File Full Name: $($file.FullName)"
    Write-Host "Random Start: $randomStart"
    Write-Host "Crop Filter: $cropFilter"
    Write-Host "Output: $output"

    # Run FFmpeg to extract, crop, and save video
    $ffmpegCmd = "ffmpeg -i '$($file.FullName)' -ss $randomStart -t $segmentDuration -vf '$cropFilter' -c:v libx264 -c:a aac -strict experimental '$output'"
    Write-Host "Executing Command: $ffmpegCmd"
    
    $ffmpegOutput = & ffmpeg -i $file.FullName -ss $randomStart -t $segmentDuration -vf $cropFilter -c:v libx264 -c:a aac -strict experimental $output 2>&1 | Out-String

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error processing $($file.Name):"
        Write-Host $ffmpegOutput
    }
    else {
        Write-Host "Processed $($file.Name) -> $output"
    }
}
