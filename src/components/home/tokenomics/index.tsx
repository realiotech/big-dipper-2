import React from 'react';
import numeral from 'numeral';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';
import { useTokenomics } from './hooks'
import {
    Box, For, Text, GridItem
} from '@chakra-ui/react';
import CustomToolTip from '@src/components/helper/tooltip';
import useTranslation from 'next-translate/useTranslation';

const Tokenomics = () => {
    const { state } = useTokenomics();
    const { t } = useTranslation('home');

    const data = [
        {
            legendKey: 'bonded',
            percentKey: 'bondedPercent',
            value: numeral(state.bonded).format('0,0'),
            rawValue: state.bonded,
            percent: `${numeral((state.bonded * 100) / state.total).format('0.00')}%`,
            fill: "#2FB6E0",
        },
        {
            legendKey: 'unbonding',
            value: numeral(state.unbonding).format('0,0'),
            rawValue: state.unbonding,
            percent: `${numeral((state.unbonding * 100) / state.total).format('0.00')}%`,
            fill: "#20D494",
        },
    ];

    return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8'>
            <Text>
                Staking
            </Text>
            <Box>
                {data.map((x) => (
                    <Box>
                        <Text>
                            {x.value}
                            {' '}
                            {'RIO/RST'}
                        </Text>
                        <Text>
                            {t(x.legendKey)}
                        </Text>
                    </Box>
                ))}
            </Box>
            <Box>

                <PieChart
                    width={200}
                    height={100}
                    cy={100}
                >
                    <Pie
                        stroke="none"
                        // cornerRadius={40}
                        cy={90}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                        // innerRadius={79}
                        outerRadius={90}
                        fill="#8884d8"
                        // paddingAngle={-10}
                        dataKey="rawValue"
                        // stroke={theme.palette.background.paper}
                        // strokeWidth={3}
                        isAnimationActive={false}
                    >
                        {data.map((entry) => {
                            return (
                                <Cell key={entry.legendKey} fill={entry.fill} />
                            );
                        })}
                    </Pie>
                    <Tooltip
                        content={(
                            <CustomToolTip>
                                {(x) => {
                                    return (
                                        <>
                                            <Text>
                                                {t(x.legendKey)}
                                            </Text>
                                            <Text>
                                                {x.value}
                                            </Text>
                                        </>
                                    );
                                }}
                            </CustomToolTip>
                        )}
                    />
                </PieChart>

                <Box>
                    {
                        data.map((x) => {
                            return (
                                <Box>
                                    <Text>
                                        {t(x.legendKey)}
                                    </Text>
                                </Box>
                            );
                        })
                    }
                </Box>
            </Box>
        </GridItem>
    );
};

export default Tokenomics;
