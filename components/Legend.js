// import Grid from '@mui/material/Grid'
// import Stack from '@mui/material/Stack'

// export default function Legend({ items }) {
//   return (
//     <Grid
//       container
//       style={{
//         'margin-top': '67vh',
//       }}
//     >
//       <Grid item xs={9}></Grid>
//       <Grid
//         item
//         xs={3}
//         style={{
//           width: '100%',
//           marginLeft: '70%',
//           'border-radius': '2px',
//           border: '2px solid #ccc',
//           'padding-top': '5px',
//           'padding-left': '5px',
//           'padding-right': '5px',
//           'padding-bottom': '0',
//         }}
//       >
//         {items.map((item, index) => (
//           <Stack
//             direction='row'
//             key={index}
//             style={{
//               'align-items': 'center',
//               'margin-bottom': '0.5em',
//             }}
//           >
//             <div style={{ display: 'flex', flexDirection: 'row' }}>
//               <div
//                 style={{
//                   width: '1em',
//                   height: '1em',
//                   border: '1px solid #ccc',
//                   borderRadius: '2px',
//                   backgroundColor: item.color,
//                   marginRight: '0.5em',
//                 }}
//               />
//               <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
//                 {item.label}
//               </span>
//             </div>
//           </Stack>
//         ))}
//       </Grid>
//     </Grid>
//   )
// }
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'

export default function Legend({ items }) {
  return (
    <div
      style={{
        backgroundColor: 'aliceblue',
        width: 'fit-content',
        borderRadius: '2px',
        border: '2px solid #ccc',
        paddingTop: '5px',
        paddingLeft: '5px',
        paddingRight: '5px',
        overflow: 'auto',
        minWidth: '125px',
        // marginTop: '67vh',
        fontFamily: 'Helvetica',
        position: 'absolute',
        bottom: '20px',
        right: '20px',
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5em',
            flexWrap: 'nowrap',
          }}
        >
          <div
            style={{
              width: '1em',
              height: '1em',
              border: '1px solid #ccc',
              borderRadius: '2px',
              backgroundColor: item.color,
              marginRight: '0.5em',
              minWidth: '20px',
            }}
          />
          <span style={{ fontSize: '0.9em' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
