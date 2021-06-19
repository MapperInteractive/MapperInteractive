from typing import List, Tuple
from enum import Enum


class Sign(Enum):
    PLUS = 1
    MINUS = 0


class EnhancedNode:
    __slots__ = ['interval_index', 'cluster_index', 'sign', 'members']

    def __init__(self, interval_index: int, cluster_index: int, sign: Sign, members: List[int]):
        self.interval_index: int = interval_index
        self.cluster_index: int = cluster_index
        self.sign: Sign = sign
        self.members: List[int] = members
    
    def __repr__(self):
        return f'EnhancedNode: {self.interval_index}, {self.cluster_index}, {self.sign}. Members: {self.members}'

    def short_string(self):
        return f'node-{self.interval_index}-{self.cluster_index}-{self.sign}'

class Node:
    __slots__ = ['interval_index', 'cluster_index', 'members']

    def __init__(self, interval_index:int, cluster_index:int, members: List[int]):
        self.interval_index, self.cluster_index, self.members = interval_index, cluster_index, members
    
    def __repr__(self):
        return f'Node: {self.interval_index}, {self.cluster_index}. Members: {self.members}'

    def short_string(self):
        return f'node-{self.interval_index}-{self.cluster_index}'
