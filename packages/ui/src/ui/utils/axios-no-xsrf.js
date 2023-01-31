import axios from 'axios';

const axiosNoXSRF = axios.create();

// Do not send xsrf token by default, request will result in error
axiosNoXSRF.defaults.xsrfCookieName = '';

export default axiosNoXSRF;
