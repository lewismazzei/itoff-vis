import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'

export default function Legend({ items }) {
  return (
    <Grid
      container
      style={{
        'margin-top': '67vh',
      }}
    >
      <Grid item xs={9}></Grid>
      <Grid
        item
        xs={3}
        style={{
          width: '100%',
          marginLeft: '70%',
          'border-radius': '2px',
          border: '2px solid #ccc',
          'padding-top': '5px',
          'padding-left': '5px',
          'padding-right': '5px',
          'padding-bottom': '0',
        }}
      >
        {items.map((item, index) => (
          <Stack
            direction='row'
            key={index}
            style={{
              'align-items': 'center',
              'margin-bottom': '0.5em',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div
                style={{
                  width: '1em',
                  height: '1em',
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  backgroundColor: item.color,
                  marginRight: '0.5em',
                }}
              />
              <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
                {item.label}
              </span>
            </div>
          </Stack>
        ))}
      </Grid>
    </Grid>
  )
}
