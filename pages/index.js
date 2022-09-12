// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
import { useState } from 'react'
import { google } from 'googleapis'
import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

export async function getServerSideProps() {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Sheet1',
  })

  const rows = response.data.values.slice(1)
  const species = rows.map((row) => row[0])

  return {
    props: {
      species,
    },
  }
}

export default function Home({ species }) {
  const [searched, setSearched] = useState(species)

  const Row = ({ index, key, data, style }) => {
    console.log(data)
    return (
      <ListItem style={style} key={key} component='div' disablePadding>
        <ListItemButton>
          <ListItemText primary={data[index]} />
        </ListItemButton>
      </ListItem>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Allotment snap>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemData={searched}
              itemCount={searched.length}
              itemSize={46}
              overscanCount={50}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
        <div></div>
      </Allotment>
    </div>
  )
}
