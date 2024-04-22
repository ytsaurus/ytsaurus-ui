import routes from '../ytsaurus-ui.server/routes';

const customRoutes: typeof routes = {
    ...routes,
    'GET /custom/api/my/service/{cluster}/{option}': {
        handler: (req, res) => {
            const {cluster, option} = req.params;
            res.send({cluster, option, message: 'Hello world'});
        },
    },
};

export default customRoutes;
