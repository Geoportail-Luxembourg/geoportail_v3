from pyramid.view import view_config

import logging
from c2cgeoportal_geoportal.views.entry import Entry

log = logging.getLogger(__name__)


class JsapiEntry(Entry):

    @view_config(route_name='jsapilayers',
                 renderer='json')
    def apilayers(self):
        '''
        View to return a list of layers.
        Same as the theme service but in a flat representation.
        '''
        themes, errors = self._themes(None, None, u'main', True, 2, True)

        layers = {}

        # get themes layers
        for theme in themes:
            self._extract_layers(theme, layers)

        # get background layers
        group, errors = self._get_group(None, u'background', None, u'main', 2)
        self._extract_layers(group, layers, True)
        return layers

    @view_config(route_name='jsapiloader',
                 renderer='geoportailv3:templates/api/apiv3loader.js')
    def apiloader(self):
        config = self.settings
        referrer = config["referrer"]
        if "sc" in self.request.params and \
           referrer is not None and \
           "cookie_name" in referrer and \
           "cookie_value" in referrer and \
           "cookie_domain" in referrer:
            cookie_name = referrer["cookie_name"]
            cookie_value = referrer["cookie_value"]
            cookie_domain = referrer["cookie_domain"]
            self.request.response.set_cookie(
                cookie_name, value=cookie_value, domain=cookie_domain)

        return {}

    @view_config(route_name='jsapiexample',
                 renderer='geoportailv3:templates/api/apiv3example.html')
    def apiexample(self):
        return {}

    def _extract_layers(self, node, layers, bg=False):
        for child in node.get('children'):
            if 'children' in child:
                self._extract_layers(child, layers)
            else:
                if bg:
                    child['isBgLayer'] = True
                layers[child.get('id')] = child
