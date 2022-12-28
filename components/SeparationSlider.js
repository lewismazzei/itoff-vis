import { Slider } from '@mui/material'

export default function SeparationSlider({ maxLevel, onChange, disabled }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        right: '15px',
        width: 'fit-content',
        height: 'fit-content',
        minWidth: '200px',
        minHeight: '50px',
        padding: '10px 20px 10px 20px',
        border: '2px solid #ccc',
        textAlign: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'aliceblue',
      }}
    >
      <div style={{ marginBottom: '0.5em', letterSpacing: '0.05em' }}>
        <strong style={{ color: '#1f2232' }}>Max Degree of Separation</strong>
      </div>
      <Slider
        defaultValue={0}
        valueLabelDisplay='auto'
        step={1}
        min={0}
        max={maxLevel}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
