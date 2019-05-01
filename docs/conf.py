# must pip install sktda_docs_config
from sktda_docs_config import *

project = 'Mapper Interactive'
copyright = '2019, Yaodong Zhao and Nathaniel Saul'
author = 'Yaodong Zhao and Nathaniel Saul'

# The short X.Y version
version = ''
# The full version, including alpha/beta/rc tags
release = '1.2'

html_logo = "logo.png"

html_extra_path = ['CNAME']

html_theme_options.update({
  # Google Analytics info
#   'ga_ua': '',
#   'ga_domain': '',
  'gh_url': 'MapperInteractive'
})

html_short_title = project
htmlhelp_basename = 'MapperInteractivedoc'

