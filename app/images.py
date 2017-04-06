from PIL import Image, ImageOps, ImageDraw

def process_profile_picture(img_data, size=(100, 100)):
    """Process profile picture to be the correct size and shape and to
    have a circular mask.

    Parameters
    ----------
    img_data : BytesIO
    size : (int, int)

    Returns
    -------
    output : PIL.Image
    """
    # open the image data
    im = Image.open(img_data)

    # resize the image
    im.thumbnail(size, Image.ANTIALIAS)

    # create a circular mask
    bigsize = (im.size[0] * 3, im.size[1] * 3)
    mask = Image.new('L', bigsize, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + bigsize, fill=255)
    mask = mask.resize(size, Image.ANTIALIAS)

    # fit image into correct size
    output = ImageOps.fit(im, size, centering=(0.5, 0.5))

    # apply the mask
    output.putalpha(mask)

    return output
