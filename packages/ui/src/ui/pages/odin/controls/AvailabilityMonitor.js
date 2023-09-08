import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import {COLS_NUMBER, ROWS_NUMBER} from '../odin-constants';
import hammer from '@ytsaurus/ui/build/esm/ui/common/hammer';

const size = 19;
const pad = 4;
const margin = {top: 20, bottom: 20, left: 20, right: 20};

const width = COLS_NUMBER * size;
const height = ROWS_NUMBER * size;

const isAvailable = function (d) {
    return d.state === 'available';
};

const isPartiallyAvailable = function (d) {
    return d.state === 'partially_available';
};

const isUnavailable = function (d) {
    return d.state === 'unavailable' || d.state === 'timed_out' || d.state === 'unknown';
};

const computeX = function (d, i) {
    return size * (i % COLS_NUMBER);
};
const computeY = function (d, i) {
    return size * Math.floor(i / COLS_NUMBER);
};
const getHours = function (d, i) {
    return Math.floor(i / COLS_NUMBER);
};
const getMinutes = function (d, i) {
    return i % COLS_NUMBER;
};

function init(element) {
    const canvas = d3
        .select(element)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const rowLabels = canvas
        .selectAll('text.availability-row-label')
        .data(d3.range(0, ROWS_NUMBER))
        .enter()
        .append('text')
        .attr('class', 'availability-row-label')
        .attr('text-anchor', 'end')
        .attr('x', -pad)
        .attr('y', (d) => {
            return size * (1 + d) - pad;
        })
        .text((d) => {
            return d.toString();
        });

    const colLabels = canvas
        .selectAll('text.availability-col-label')
        .data(d3.range(0, COLS_NUMBER))
        .enter()
        .append('text')
        .attr('class', 'availability-col-label')
        .attr('text-anchor', 'middle')
        .attr('x', (d) => {
            return size * (0.5 + d);
        })
        .attr('y', -pad)
        .text((d) => {
            return d.toString();
        });

    const tooltip = d3
        .select(element)
        .append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('opacity', 0);

    const items = canvas
        .selectAll('rect.availability')
        .data(d3.range(0, COLS_NUMBER * ROWS_NUMBER));

    items
        .enter()
        .append('rect')
        .classed('availability', true)
        .attr('width', size)
        .attr('height', size)
        .attr('x', computeX)
        .attr('y', computeY);

    return {
        canvas,
        rowLabels,
        colLabels,
        tooltip,
    };
}

function update(domData, data, showInfo) {
    const {canvas, rowLabels, colLabels, tooltip} = domData;

    const items = canvas.selectAll('rect.availability').data(data);
    items
        .classed('availability-high', isAvailable)
        .classed('availability-medium', isPartiallyAvailable)
        .classed('availability-low', isUnavailable)
        .on('click', function (e, d) {
            if (typeof showInfo === 'function') {
                const i = items.nodes().indexOf(this);
                showInfo(d, getHours(d, i), getMinutes(d, i));
            }
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0).style('pointer-events', 'none');
        })
        .on('mouseover', function (e, d) {
            const i = items.nodes().indexOf(this);
            items.classed('availability-mouseover', (p, j) => {
                return (
                    Math.floor(i / COLS_NUMBER) === Math.floor(j / COLS_NUMBER) ||
                    i % COLS_NUMBER === j % COLS_NUMBER
                );
            });

            rowLabels.classed('availability-mouseover', (p, j) => {
                return Math.floor(i / COLS_NUMBER) === j;
            });

            colLabels.classed('availability-mouseover', (p, j) => {
                return i % COLS_NUMBER === j;
            });

            const row = Math.floor(i / COLS_NUMBER);
            const col = i % COLS_NUMBER;
            const top = row * size + margin.top;
            const left = col * size + size / 2 + margin.left;
            tooltip
                .text(hammer.format.Readable(d.state, {caps: 'all'}))
                .style('opacity', 1)
                .style('pointer-events', 'all')
                .style('top', top + 'px')
                .style('left', left + 'px');
        });
}

function useInitMonitor(ref) {
    const [domData, setDomData] = useState(null);

    useEffect(() => {
        const domData = init(ref.current);
        setDomData(domData);
    }, []);

    return domData;
}

function useUpdateMonitor(domData, data, showInfo) {
    useEffect(() => {
        if (domData) {
            update(domData, data, showInfo);
        }
    }, [domData, data, showInfo]);
}

function AvailabilityMonitor({data, showInfo}) {
    const monitorRef = useRef();
    const domData = useInitMonitor(monitorRef);

    useUpdateMonitor(domData, data, showInfo);

    return <div className="odin__monitor" ref={monitorRef} />;
}

AvailabilityMonitor.propTypes = {
    data: PropTypes.array.isRequired,
    showInfo: PropTypes.func,
};

export default AvailabilityMonitor;
