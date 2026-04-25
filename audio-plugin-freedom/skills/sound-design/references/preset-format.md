# Preset File Format

## JUCE ValueTree XML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<preset name="[PresetName]" category="[Category]" version="1.0">
  <parameters>
    <PARAM id="[paramId]" value="[normalizedValue]"/>
  </parameters>
  <metadata>
    <description>[Description]</description>
    <author>Factory</author>
    <tags>[comma,separated,tags]</tags>
  </metadata>
</preset>
```

## Naming Conventions
- Use descriptive names (not numbers)
- Category prefix optional: "Clean - Studio Direct"
- Avoid special characters in filenames
- Use spaces in display names, hyphens in filenames

## Parameter Values
- All values normalized to parameter ranges from parameter-spec.md
- Use the APVTS parameter IDs exactly as specified
- Default preset should match parameter defaults
