param (
    [int]$numSegments = 10, # Number of segments to generate
    [int]$segmentDuration = 15  # Segment duration in seconds
)

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
    $jobs = @()
    for ($i = 0; $i -lt $numSegments; $i++) {
        $jobs += [pscustomobject]@{
            File         = $file
            RandomStart  = if ($totalSeconds - $segmentDuration -gt 0) { Get-Random -Minimum 0 -Maximum ($totalSeconds - $segmentDuration) } else { 0 }
            CropFilter   = $cropFilter
            SegmentIndex = $i
        }
    }

    $jobs | ForEach-Object {
        $job = $_
        Start-Job -ScriptBlock {
            param ($job, $segmentDuration)
            
            $timestamp = Get-Date -Format "yyyyMMddHHmmss"
            $output = Join-Path -Path $job.File.DirectoryName -ChildPath ("cropped_" + $job.File.BaseName + "_" + $timestamp + "_segment" + $job.SegmentIndex + $job.File.Extension)

            Write-Host "File Full Name: $($job.File.FullName)"
            Write-Host "Random Start: $($job.RandomStart)"
            Write-Host "Crop Filter: $($job.CropFilter)"
            Write-Host "Output: $output"

            $ffmpegCmd = "ffmpeg -i '$($job.File.FullName)' -ss $($job.RandomStart) -t $segmentDuration -vf '$($job.CropFilter)' -c:v libx264 -c:a aac -strict experimental '$output'"
            Write-Host "Executing Command: $ffmpegCmd"

            $ffmpegOutput = & ffmpeg -i $job.File.FullName -ss $job.RandomStart -t $segmentDuration -vf $job.CropFilter -c:v libx264 -c:a aac -strict experimental $output 2>&1 | Out-String

            if ($LASTEXITCODE -ne 0) {
                Write-Host "Error processing $($job.File.Name):"
                Write-Host $ffmpegOutput
            }
            else {
                Write-Host "Processed $($job.File.Name) -> $output"
            }
        } -ArgumentList $job, $segmentDuration
    }
}
