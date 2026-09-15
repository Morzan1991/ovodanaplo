# -*- coding: utf-8 -*-
"""
Gondozott irodalmi korpusz — a mesék, versek, mondókák és dalok egyetlen
igazságforrása. Az évszakonkénti részek regisztrálják magukat a `base.KORPUSZ`
szótárba, ez a modul csak összefogja őket.

Használat:  from korpusz import KORPUSZ
"""

from .base import KORPUSZ, MUFAJ_TERULET, MUFAJ_CIMKE, MUFAJ_SORREND  # noqa: F401
from . import osz, tel, tavasz, kiegeszites, tappancs, kiegeszites_uj  # noqa: F401
