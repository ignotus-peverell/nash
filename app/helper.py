from flask import jsonify, session
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

def continue_response(var):
    kwargs = dict()
    kwargs[var] = [('Continue', None)]
    return response_options(**kwargs)


class Helper(object):
    @staticmethod
    def Cinderella(data):
        return dict(
            helper_state='cinderella2',
            helper_speech=helper_speech(
                "Hello, I'm Nash the bear. I'm here to help you learn to use the site.",
                "Are you familiar with the story of Cinderella?"),
            response=yes_no('talk'))

    @staticmethod
    def cinderella2(data):
        if not data['talk']:
            return dict(
                helper_state='cinderella_story1',
                helper_speech=helper_speech(
                    "Cinderella wanted to go to the ball, but her evil stepmother and evil stepsisters wouldn't let her."
                ),
                response=continue_response('talk'))
        else:
            return dict(
                helper_state='cinderella3',
                helper_speech=helper_speech(
                    "OK! Here is a picture of some of the weird things that happened to Cinderella.",
                    "Each circle represents something that happened to Cinderella.",
                ),
                response=continue_response('talk'))

    @staticmethod
    def cinderella_story1(data):
        return dict(
            helper_state='cinderella_story2',
            helper_speech=helper_speech(
                "But then, the night of the ball, Cinderella's fairy godmother showed up.",
                "She made Cinderella a magic dress that was fancy enough that Cinderella could go to the ball."
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella_story2(data):
        return dict(
            helper_state='cinderella_story3',
            helper_speech=helper_speech(
                "Cinderella went to the ball and danced all night with Prince Charming.",
                "But then midnight struck and she had to leave, or her gown would turn back to tatters.",
                "She dropped her glass slipper as she ran away."
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella_story3(data):
        return dict(
            helper_state='cinderella_story4',
            helper_speech=helper_speech(
                "Prince Charming searched high and low for the beautiful woman he had danced with.",
                "He knew that the glass slipper she left behind would only fit on her foot.",
                "So he went to every house in the kingdom, asking the women of the house to try on the glass slipper."
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella_story4(data):
        return dict(
            helper_state='cinderella3',
            helper_speech=helper_speech(
                "The slipper fit on Cinderella's foot, and so Prince Charming married her, and they lived happily ever after.",
                "Here is a picture of some of the weird things that happened to Cinderella.",
                "Each circle represents something that happened to Cinderella.",
            ),
            response=continue_response('talk'))
    
    @staticmethod
    def cinderella3(data):
        return dict(
            helper_state='cinderella4',
            helper_speech=helper_speech(
                "The first circle is red because it seems very weird to Cinderella that she has a fairy godmother who could make her a magic dress.",
                "Why don't you click on the picture of Prince Charming?",
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella4(data):
        return dict(
            helper_state='cinderella5',
            helper_speech=helper_speech(
                "Now the second circle is red.",
                "Prince Charming doesn't believe that Cinderella has a fairy godmother who made her a magic dress, but he can't explain how she got her fancy dress, and that's weird.",
                "Why don't you click on the picture of the Evil Stepsister?"
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella5(data):
        return dict(
            helper_state='cinderella6',
            helper_speech=helper_speech(
                "Now the last circle is red.",
                "The evil stepsister doesn't believe that Cinderella was at the ball at all!",
                "She can't explain why the glass slipper fits Cinderella's foot, and that's weird, which is why the circle is red."
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella6(data):
        return dict(
            helper_state='cinderella7',
            helper_speech=helper_speech(
                "Why don't you try right-clicking on 'Cinderella at ball', and selecting 'Make true'?" 
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella7(data):
        return dict(
            helper_state='cinderella8',
            helper_speech=helper_speech(
                "Now we have two red circles, because it seems weird that Cinderella would have a fancy dress for no reason, and it also seems weird that the slipper would fit Cinderella's foot if she wasn't the one who dropped it.",
                "We also have a red arrow, because it seems weird to say that Cinderella was at the ball but was not the one who dropped the slipper.",
                "An arrow means that we would expect the circle before the arrow to cause the circle after the arrow."
            ),
            response=continue_response('talk'))

    @staticmethod
    def cinderella8(data):
        return dict(
            helper_state='cinderella9',
            helper_speech=helper_speech(
                "Now that we have this picture, we can talk about the weird things that happened to Cinderella, and everyone can have their own point of view."
            ),
            response=continue_response('talk'))
    
        
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
                    "What would you like help with?"),
                response=response_options(
                    talk=[('Something weird happened', 'weird'),
                          ('Nobody believes me', 'belief'),
                          ('I want to add stuff to the graph I already made',
                           'help')]
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
        elif data['talk'] == 'help':
            return dict(
                helper_state='help',
                helper_speech=helper_speech(
                    "Why don't you click on the node you want help with?"
                ),
                select_node=True,
                response=''
            )
        else:
            assert False

    @staticmethod
    def help(data):
        session['focus_node'] = data['node']['label']
        return dict(helper_state='help2',
                    helper_speech=helper_speech(
                        "Is this something you witnessed directly?"
                    ),
                    response=yes_no('talk')
        )

    @staticmethod
    def help2(data):
        if data['talk']:
            return dict(helper_state='help_weird',
                        helper_speech=helper_speech(
                            "OK. Let's think about what could have caused this.",
                            "Do you have any ideas?",
                            "You can click on a node or tell me a new thing."
                        ),
                        select_node=True,
                        response=response_field()
            )
        else:
            return Helper.default(data)
            
    @staticmethod
    def help_weird(data):
        if 'node' in data:
            session['focus_node'] = data['node']['label']
        else:
            assert 'user_input' in data
            return Helper.node_weird2(data)

    @staticmethod
    def help_belief(data):
        if 'node' in data:
            session['focus_node'] = data['node']['label']
        return Helper.default(data)

    @staticmethod
    def node_weird(data):
        session['focus_node'] = data['user_input']
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
            create_edge=(data['user_input'], session['focus_node']),
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
                    
