

def subjective_graph_nodes(nodes):
    rv = []
    for node in nodes:
        print node.keys()
        rv.append(dict(index=node[u'index'],
                       id=node[u'id'],
                       truth=node.get(u'truth', False),
                       self_cause_weird=node.get(u'self_cause_weird', '3'),
        ))
    print rv
    return rv

def subjective_graph_edges(edges):
    rv = []
    for edge in edges:
        print edge.keys()
        rv.append(dict(source=edge[u'source'],
                       target=edge[u'target'],
        ))
    return rv

def objective_graph_nodes(nodes):
    rv = []
    for node in nodes:
        rv.append(dict(index=node[u'index'],
                       id=node[u'id'],
                       label=node[u'label'],
                       detailed=node[u'detailed'],
                       x=node[u'x'],
                       y=node[u'y'],
                       locked=node.get(u'locked', False),
        ))
    return rv

def objective_graph_edges(edges):
    rv = []
    for edge in edges:
        rv.append(dict(source=edge[u'source'],
                       target=edge[u'target'],
                       meaning=edge.get(u'meaning', 'cause'),
                       detailed=edge[u'detailed'],
        ))
    return rv
