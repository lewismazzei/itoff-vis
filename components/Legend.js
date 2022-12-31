export default function Legend({ items }) {
  return (
    <div
      id='legend'
      style={{
        backgroundColor: 'aliceblue',
        width: 'fit-content',
        borderRadius: '2px',
        border: '2px solid #ccc',
        padding: '1em 1em 0.5em 1em',
        overflow: 'auto',
        minWidth: '125px',
        position: 'fixed',
        borderRadius: '20px',
        boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'aliceblue',
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
              width: '20px',
            }}
          />
          <span
            id='legend-label'
            style={{
              color: '#1f2232',
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
