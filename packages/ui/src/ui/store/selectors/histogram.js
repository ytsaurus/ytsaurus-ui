import hammer from '../../common/hammer';
import {createSelector} from 'reselect';

const getHistogram = (state, props) => props.histogram;

export const createGetQuartiles = () =>
    createSelector(getHistogram, (histogram) => hammer.stat.quartiles(histogram.data));

export const createGetPDF = () =>
    createSelector(getHistogram, (histogram) => hammer.stat.pdf(histogram.data));

export const createGetECDF = () =>
    createSelector([getHistogram, createGetPDF()], (histogram, pdf) => {
        const ecdf = hammer.stat.ecdf(histogram.data);

        // Create fake points
        ecdf.steps.unshift({
            x: pdf.min,
            y: 0,
        });
        ecdf.steps.push({
            x: pdf.min + pdf.bucketNumber * pdf.bucketSize,
            y: 100,
        });

        return ecdf;
    });

export const createGetIsDataGood = () =>
    createSelector(
        [createGetPDF(), createGetECDF(), createGetQuartiles()],
        (pdfData, ecdfData, quartiles) => {
            if (pdfData.min === pdfData.max) {
                // All points are the same
                return false;
            } else if (ecdfData.steps.length < 5) {
                // We have got too few different points in data (including fake points)
                return false;
            } else if (quartiles.q75 - quartiles.q25 === 0) {
                // All points are almost the same
                return false;
            } else {
                return true;
            }
        },
    );
