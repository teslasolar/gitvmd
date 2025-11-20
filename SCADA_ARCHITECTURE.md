# GitVMD SCADA/HMI Architecture

## Overview
Ignition Perspective-compatible, ISA-95 compliant SCADA/HMI system hosted on GitHub Pages.

## Architecture Principles

### 1. Modular Components (<250 tokens each)
- Each component: separate JSON file
- Easy version control with Git
- Scalable for enterprise deployment
- Compatible with Ignition Perspective format

### 2. ISA-95 Compliance
```
Level 4: ERP (External Integration)
Level 3: MES/SCADA (GitVMD Core)
Level 2: HMI/Supervisory (GitVMD Primary)
Level 1: PLC/DCS (Tag Sources)
Level 0: Physical Process (Sensors/Actuators)
```

### 3. GitHub Pages Deployment
- Static HTML/CSS/JavaScript
- JSON-based view definitions
- Real-time tag binding via WebSocket/REST
- Offline-capable with Service Workers

## File Structure

```
gitvmd/
├── components/          # Component library
│   ├── symbols/        # ISA-5.1 symbols (valve, pump, tank)
│   ├── chart/          # Trending and gauges
│   ├── input/          # Buttons, sliders, fields
│   ├── display/        # Labels, tables, indicators
│   ├── container/      # Layout containers
│   └── navigation/     # Menus, tabs
├── views/              # HMI screen definitions
│   ├── overview.json   # Plant overview
│   ├── process-detail.json
│   ├── alarms.json
│   └── trends.json
├── public/             # GitHub Pages root
│   ├── index.html
│   ├── styles/
│   └── js/
└── src/
    └── core/           # View loader, component registry
```

## Component Structure

Each component JSON follows this pattern:

```json
{
  "meta": {
    "type": "perspective.component",
    "category": "symbols",
    "name": "valve",
    "version": "1.0.0",
    "isa": "ISA-5.1"
  },
  "props": {
    "state": {
      "type": "string",
      "enum": ["open", "closed"],
      "default": "closed"
    },
    "tagPath": {
      "type": "string",
      "binding": true
    }
  },
  "events": {
    "onClick": "action"
  }
}
```

## View Structure

Views define complete HMI screens:

```json
{
  "meta": {
    "name": "Process Detail",
    "isa95Level": 2,
    "processCell": "PC-001"
  },
  "params": {
    "unitId": { "type": "string" }
  },
  "root": {
    "type": "container.coordinate",
    "children": [
      {
        "type": "symbols.tank",
        "props": {
          "level": "{tank01.level}",
          "tagPath": "site/area1/tank01"
        }
      }
    ]
  }
}
```

## Tag Binding

Tag bindings use Ignition-style syntax:

```
{tagPath}           - Direct tag read
{=tagPath}          - Expression binding
{view.params.name}  - View parameter
{session.custom}    - Session property
```

## ISA-88 Batch Integration

Support for batch control hierarchy:

- **Physical Model**: Enterprise → Site → Area → Process Cell → Unit
- **Procedural Model**: Procedure → Unit Procedure → Operation → Phase
- **Recipe Management**: Master Recipe → Control Recipe → Batch

## Component Categories

### Symbols (ISA-5.1 Compliant)
- Valve (gate, globe, ball, butterfly, check)
- Pump (centrifugal, positive displacement)
- Motor (3-phase, single-phase, DC)
- Tank/Vessel (with level indication)
- Sensor (temperature, pressure, flow, level)
- Conveyor, Agitator, Heat Exchanger

### Charts
- Time Series Chart (real-time trending)
- Gauge (radial, linear, tank)
- XY Chart, Bar Chart, Pie Chart

### Input
- Button, Slider, Toggle
- Numeric Entry, Text Field
- Dropdown, Radio Group, Checkbox

### Display
- Label, Table, Markdown
- LED Display, Icon, Image
- Alarm Status Table

### Container
- Flex Container (responsive layout)
- Coordinate Container (P&ID diagrams)
- Column Container, View Canvas

### Navigation
- Horizontal/Vertical Menu
- Breadcrumb, Tab Container, Tree

## Enterprise Features

### Version Control
- Git-based versioning of all HMI screens
- Branch-based development workflow
- Pull request review for changes
- Rollback capabilities

### CI/CD Pipeline
```yaml
1. Validate component JSON schemas
2. Test view rendering
3. Build optimized bundle
4. Deploy to GitHub Pages
5. Zero-downtime updates
```

### Security
- Read-only tag browsing by default
- Authentication via session management
- Role-based component visibility
- Audit logging of operator actions

### Performance
- Lazy-load components on-demand
- Service Worker for offline mode
- WebSocket for real-time updates
- IndexedDB for historical data cache

## Integration Points

### Tag Providers
- OPC UA (via gateway)
- MQTT (IoT devices)
- REST API (MES/ERP systems)
- WebSocket (real-time updates)

### External Systems
- Ignition Gateway (native integration)
- Historian (time-series data)
- MES (production tracking)
- ERP (business integration)

## Deployment

### GitHub Pages Setup
```bash
1. Create repository: gitvmd
2. Enable GitHub Pages (main branch, /public folder)
3. Configure custom domain (optional)
4. Deploy via GitHub Actions
```

### URL Structure
```
https://company.github.io/gitvmd/
  ├── index.html              # Main entry point
  ├── views/overview          # Load overview view
  ├── views/process-detail?unitId=UNIT-001
  └── components/symbols/valve.json
```

## Scalability

### Multi-Site Deployment
- Separate repository per site
- Shared component library (Git submodule)
- Site-specific views and configuration
- Centralized monitoring dashboard

### Performance Targets
- Initial load: <2s
- View switch: <500ms
- Tag update: <100ms
- Support 1000+ tags per view
- 100+ concurrent users

## Standards Compliance

- **ISA-95**: Enterprise-control integration
- **ISA-88**: Batch control
- **ISA-5.1**: Instrumentation symbols
- **ISA-18.2**: Alarm management
- **IEC 62443**: Cybersecurity
- **21 CFR Part 11**: Electronic records (pharma)

## Future Enhancements

1. **AI Integration**: Predictive maintenance, anomaly detection
2. **AR/VR Support**: 3D plant visualization
3. **Mobile Apps**: iOS/Android native apps
4. **Voice Control**: Operator voice commands
5. **Digital Twin**: Real-time simulation integration

---

**Built for ISA-95 enterprise automation. Deployable on free GitHub Pages.**
