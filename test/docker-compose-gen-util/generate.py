import jinja2
import yaml
import os
from lxml import etree

config = { 'totalOfNodes': 100 }

templateFilePath = jinja2.FileSystemLoader(os.getcwd())

jinjaEnv = jinja2.Environment(loader=templateFilePath,trim_blocks=True,lstrip_blocks=True)

jTemplate = jinjaEnv.get_template('template.j2')

with open('docker-compose.yaml', 'w') as file:
    file.write(jTemplate.render(config))
