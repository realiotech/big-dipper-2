import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs, { formatDayJs } from '@utils/dayjs';
import { useHero, usePrice } from './hooks';
import { Box, GridItem, Text } from '@chakra-ui/react';
import { TokenPriceType } from './types';
import numeral from 'numeral';
import CustomToolTip from '../../helper/tooltip';

const TokenPrice: React.FC<{ items: TokenPriceType[] } & ComponentDefault> = (props) => {
  const {
    tickPriceFormatter,
    formatTime,
  } = usePrice();
  const formatItems = props.items.map((x) => {
    return ({
      time: formatTime(dayjs.utc(x.time), "locale"),
      fullTime: formatDayJs(dayjs.utc(x.time), "locale"),
      value: x.value,
    })    
  })
  return (
    <ResponsiveContainer width="99%" maxHeight={300}>
      <AreaChart
        data={formatItems}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={"#C64155"}
              stopOpacity={0.5}
            />
            <stop
              offset="95%"
              stopColor={"#C64155"}
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={"#E8E8E8"} />
        <XAxis
          dataKey="time"
          tickLine={false}
        />
        <YAxis
          tickLine={false}
          tickFormatter={tickPriceFormatter}
        />
        <Tooltip cursor={false} content={(
          <CustomToolTip>
            {(x) => {
              return (
                <>
                  <Text >
                    {x.fullTime}
                  </Text>
                  <Text>
                    $
                    {numeral(x.value).format('0,0.00')}
                  </Text>
                </>
              );
            }}
          </CustomToolTip>
        )} />
        <Area type="monotone" dataKey="value" stroke="#C64155" fill="#C64155" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const PriceChart = () => {
  const { state } = useHero();
  return (
    <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
      <Text fontSize='24px' pb='6'>
        Price (~24h)
      </Text>
      <TokenPrice items={state.loading ? [] : state.tokenPriceHistory} />
    </GridItem>
  )
}


export default PriceChart;
