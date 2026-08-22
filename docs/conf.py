"""Sphinx configuration for the Clera documentation site."""

project = "Clera"
copyright = "Clera"
author = "Erasmus A. Junior (eirasmx)"

extensions = [
    "myst_parser",
    "sphinx_copybutton",
]

source_suffix = {
    ".md": "markdown",
}

root_doc = "index"

exclude_patterns = [
    "guidelines.md",
    "todo.md",
    "_build",
    "Thumbs.db",
    ".DS_Store",
]

myst_enable_extensions = [
    "colon_fence",
    "deflist",
    "substitution",
]

myst_heading_anchors = 3

templates_path = ["_templates"]

html_theme = "furo"
html_title = "Clera Docs"
html_static_path = ["_static"]
html_css_files = ["custom.css"]

html_theme_options = {
    "light_css_variables": {
        "color-brand-primary": "#1d4ed8",
        "color-brand-content": "#1d4ed8",
        "color-background-primary": "#ffffff",
        "color-background-secondary": "#f3f4f6",
    },
    "dark_css_variables": {
        "color-brand-primary": "#60a5fa",
        "color-brand-content": "#60a5fa",
        "color-background-primary": "#1f2937",
        "color-background-secondary": "#111827",
    },
    "sidebar_hide_name": False,
}
