# ISA-95 Enterprise Architecture for GitVMD

## ISA-95 Five-Level Hierarchy

```
Level 4: Business Planning & Logistics (ERP)
         └─ Enterprise Resource Planning
         └─ Business Intelligence
         └─ Asset Management

Level 3: Manufacturing Operations Management (MES/SCADA)
         └─ Manufacturing Execution System
         └─ SCADA Visualization (GitVMD Target)
         └─ Batch Management (ISA-88)
         └─ Quality Management

Level 2: Supervisory Control (HMI/SCADA)
         └─ Human Machine Interface
         └─ Supervisory Control
         └─ Data Acquisition
         └─ Recipe Management

Level 1: Sensing & Manipulation
         └─ PLCs (Programmable Logic Controllers)
         └─ DCS (Distributed Control Systems)
         └─ RTUs (Remote Terminal Units)
         └─ Smart Sensors/Actuators

Level 0: Physical Process
         └─ Sensors
         └─ Actuators
         └─ Physical Equipment
```

## GitVMD Positioning

**Primary Target**: Level 2-3 Interface
- Web-based HMI/SCADA visualization
- Real-time data display
- Alarm management
- Trend analysis
- Recipe/batch visualization

## ISA-88 Batch Control Integration

### Physical Model Hierarchy
- Enterprise → Site → Area → Process Cell → Unit → Equipment Module → Control Module

### Procedural Model
- Procedure → Unit Procedure → Operation → Phase

## Data Exchange Standards

### ISA-95 Information Models
- Product Definition
- Production Capability
- Production Schedule
- Production Performance
- Material Definition
- Equipment Definition
- Process Segment

## Implementation Strategy

GitVMD provides:
1. JSON-based component library (Perspective-compatible)
2. Real-time tag binding visualization
3. ISA-95 compliant data models
4. Web-native deployment (GitHub Pages)
5. Version-controlled HMI screens (Git)
