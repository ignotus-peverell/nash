from flask import jsonify
import json

def helper_speech(*ps):
    rv = ""
    for p in ps:
        rv += '<p class="helper-speech">%s</p>' % p
    return rv

def response_field():
    rv = """
<p><input type="text" onkeypress="user_speech(this, event)" /></p>
    """
    return rv

def response_options(**kwargs):
    assert len(kwargs) == 1
    rv = ""
    for k in kwargs:
        for text, value in kwargs[k]:
            assert "'" not in text
            user_speech = """
<p class="user-speech">%s</p>
""" % text
            rv += """
<p class="user-speech-input"><a onClick='helper_talk(%s)'>%s</a></p>
            """ % (json.dumps({k: value, 'user_speech': user_speech}), text)

    return rv

def yes_no(var):
    kwargs = dict()
    kwargs[var] = [('Yes', True), ('No', False)]
    return response_options(**kwargs)

class Helper(object):
    @staticmethod
    def start(data):
        return dict(
            helper_state='start2',
            helper_speech=helper_speech(
                'Hello, it is nice to see you! Would you like some help?'),
            response=yes_no('talk'))

    @staticmethod
    def start2(data):
        assert 'talk' in data
        if data['talk']:
            return dict(
                helper_state='start3',
                helper_speech=helper_speech(
                    'Great!',
                    "What's the thing that's most troubling you?"),
                response=response_options(
                    talk=[('Something weird happened', 'weird'),
                          ('Nobody believes me', 'belief')]
                ))
        else:
            return dict(
                helper_state='start',
                helper_speech=helper_speech(
                    "OK! I'll be quiet."),
                minimize=True,
                response="")

    @staticmethod
    def start3(data):
        assert 'talk' in data
        if data['talk'] == 'weird':
            return dict(
                helper_state='node_weird',
                helper_speech=helper_speech(
                    "Let's create a node for that.",
                    "What's a short description of the thing that happened?"),
                response=response_field()
            )
        elif data['talk'] == 'belief':
            return dict(
                helper_state='node_belief',
                helper_speech=helper_speech(
                    "Let's create a node for that.",
                    "What's a short description of the thing that people won't believe you about?"),
                response=response_field()
            )
        else:
            assert False

    @staticmethod
    def node_weird(data):
        return dict(
            helper_state="node_weird2",
            helper_speech=helper_speech(
                "I created a node for you.",
                "Now let's hook it up to something else.",
                "What could have caused this to happen?"),
            create_node=data['user_input'],
            response=response_field()
        )

    @staticmethod
    def node_weird2(data):
        return dict(
            helper_state="node_weird3",
            helper_speech=helper_speech(
                'OK, I created a node for that',
                'Can you think of anything else that could have caused this?'),
            create_node=data['user_input'],
            response=yes_no('talk')
        )

    @staticmethod
    def node_weird3(data):
        if data['talk']:
            return dict(
                helper_state='node_weird2',
                helper_speech=helper_speech(
                    'Good!',
                    'What else could have caused this to happen?',
                    ),
                response=response_field())
        else:
            return dict(
                helper_state='node_weird4',
                helper_speech=helper_speech(
                    'Are you sure?'
                ),
                response=yes_no('talk'))

    @staticmethod
    def node_weird4(data):
        if data['talk']:
            return Helper.default(dict())
        else:
            return Helper.node_weird3(dict(talk=True))
        
    @staticmethod
    def node_belief(data):
        return dict(
            helper_state="default",
            helper_speech=helper_speech(
                "I created a node for you.",
                "Now let's hook it up to something else.",
                "What makes you think this is true?"),
            response=response_field()
        )

    @staticmethod
    def default(data):
        return dict(helper_state='start',
                    helper_speech=helper_speech(
                        "I'm just a cartoon bear.",
                        "You've reached the limits of my knowledge."),
                    response=response_options(
                        talk=[("You did OK, cartoon bear", "OK"),
                              ("You suck, cartoon bear", "sucks")]
                        ))
                    
