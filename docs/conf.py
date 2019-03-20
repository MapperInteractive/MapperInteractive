# must pip install sktda_docs_config
from sktda_docs_config import *

project = 'MapperCore'
copyright = '2019, Yaodong Zhao and Nathaniel Saul'
author = 'Yaodong Zhao and Nathaniel Saul'

# The short X.Y version
version = ''
# The full version, including alpha/beta/rc tags
release = '1.2'

html_theme_options.update({
  # Google Analytics info
#   'ga_ua': '',
#   'ga_domain': '',
  'gh_url': 'mappercore/mappercore'
})

html_short_title = project
htmlhelp_basename = 'MapperCoredoc'

