# Ignition Perspective Component Library

## Overview
Modular, JSON-based component library compatible with Ignition Perspective SCADA/HMI standards.

## Component Categories

### 1. Chart Palette
- Time Series Chart
- XY Chart
- Power Chart
- Simple Gauge
- Chart Range Selector
- Sparkline

### 2. Container Palette
- Flex Container
- Coordinate Container
- Column Container
- View Canvas

### 3. Display Palette
- Label
- Table
- Markdown
- Icon
- Image
- LED Display
- Alarm Status Table

### 4. Input Palette
- Button
- Slider
- Toggle Switch
- Numeric Entry Field
- Text Field
- Dropdown
- Radio Group
- Checkbox

### 5. Navigation Palette
- Horizontal Menu
- Vertical Menu
- Breadcrumb
- Tab Container
- Tree

### 6. Symbols Palette (ISA-5.1 Compliant)
- Valve (Gate, Globe, Ball, Butterfly)
- Pump (Centrifugal, Positive Displacement)
- Motor (3-Phase, Single Phase)
- Tank/Vessel
- Sensor (Temperature, Pressure, Flow, Level)
- Conveyor
- Agitator
- Heat Exchanger

### 7. Chart Palette (Process)
- Trend Chart
- Bar Chart
- Pie Chart
- Gauge (Radial, Linear)

## File Organization
Each component: separate JSON file (<250 tokens)
Path: `/components/{category}/{component-name}.json`
