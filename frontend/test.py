import requests

import subprocess
import time

import threading

import board
import digitalio
from adafruit_rgb_display import st7789

from PIL import Image, ImageDraw, ImageFont

# Configuration for CS and DC pins (these are FeatherWing defaults on M0/M4):
cs_pin = digitalio.DigitalInOut(board.CE0)
dc_pin = digitalio.DigitalInOut(board.D25)
reset_pin = None

# Config for display baudrate (default max is 24mhz):
BAUDRATE = 64000000

# Setup SPI bus using hardware SPI:
spi = board.SPI()

# Create the ST7789 display:
disp = st7789.ST7789(
    spi,
    cs=cs_pin,
    dc=dc_pin,
    rst=reset_pin,
    baudrate=BAUDRATE,
    width=135,
    height=240,
    x_offset=53,
    y_offset=40,
)

# Create blank image for drawing.
# Make sure to create image with mode 'RGB' for full color.
height = disp.width  # we are swapping height/width to rotate it to landscape!
width = disp.height
image = Image.new("RGB", (width, height))
rotation = 270

# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)

# Draw a black filled box to clear the image.
draw.rectangle((0, 0, width, height), outline=0, fill=(0, 0, 0))
disp.image(image, rotation)

# Define display constants
padding = -2
top = padding
bottom = height - padding
# Move left to right keeping track of the current x position for drawing shapes.
x = 0

# Alternatively load a TTF font.  Make sure the .ttf font file is in the
# same directory as the python script!
# Some other nice fonts to try: http://www.dafont.com/bitmap.php
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)

# Turn on the backlight
backlight = digitalio.DigitalInOut(board.D22)
backlight.switch_to_output()
backlight.value = True

# Setup buttons
buttonB = digitalio.DigitalInOut(board.D23)
buttonT = digitalio.DigitalInOut(board.D24)
buttonB.switch_to_input()
buttonT.switch_to_input()

# Define chime command
chimes = {"commands": ["G01 X700 Y-1100 Z1000", "G01 X1600 Y-1100 Z1000", "G01 X1000 Y1000 Z1000"]}

def display_loop(refresh):
    while True:
        # rate
        time.sleep(refresh)
        # display
        disp.image(image, rotation)

def net_loop(refresh):
    while True:
        # flush
        draw.rectangle((0, 0, 240, 50), outline="red", fill=0)
        # get network
        cmd = "iwgetid -r"
        try:
            ssid = subprocess.check_output(cmd, shell=True).decode("utf-8").strip()
        except subprocess.CalledProcessError as e:
            ssid = "..."
        net_status = ""
        if ssid == "Line-us-Setup":
           net_status = "hold for fortune -->"
        else:
            net_status = "net: " + ssid
            cmd = "top -bn1 | grep load | awk '{printf \"dreaming: %d%%\", $(NF-2)*100}'"
        y = top + 12
        # draw
        draw.text((x, y), net_status, font=font, fill="#FFFFFF")
        # rate
        time.sleep(refresh)

display_thread = threading.Thread(target = display_loop, args=(0.05,))
net_thread = threading.Thread(target = net_loop, args=(5,))

display_thread.start()
net_thread.start()

while True:
    time.sleep(1)

# while True:
#     # Draw a black filled box to clear the image.
#     draw.rectangle((0, 0, width, height), outline=0, fill=0)

#     # Shell scripts for system monitoring from here:
#     # https://unix.stackexchange.com/questions/119126/command-to-display-memory-usage-disk-usage-and-cpu-load
#     cmd = "iwgetid -r"
#     ssid = subprocess.check_output(cmd, shell=True).decode("utf-8").strip()
#     net_status = ""
#     if ssid == "Line-us-Setup":
#         net_status = "hold for fortune -->"
#     else:
#         net_status = "net: " + ssid
#     cmd = "top -bn1 | grep load | awk '{printf \"dreaming: %d%%\", $(NF-2)*100}'"

#     CPU = subprocess.check_output(cmd, shell=True).decode("utf-8")

#     # Write stats.
#     y = top + 12
#     draw.text((x, y), net_status, font=font, fill="#FFFFFF")
#     y += font.getbbox(net_status)[3] - font.getbbox(net_status)[1] + 5
#     draw.text((x, y), CPU, font=font, fill="#FFFF00")
#     y += font.getbbox(CPU)[3] - font.getbbox(CPU)[1] + 5

#     if buttonB.value and not buttonT.value:  # just top btn pressed
#         response = requests.post('http://localhost:3000/tell', json = chimes)
#         status = response.json()
#         if status['message'] == "busy":
#             draw.text((x, y), "busy, please wait :)", font=font, fill="#FFFF00")
#         else:
#             draw.text((x, y), "divining...", font=font, fill="#FFFF00")
#     if buttonT.value and not buttonB.value:  # just bot btn pressed
#         draw.rectangle([0, 0, width, height], fill="white")
#         print("pressed bottom btn")

#     # Display image.
#     disp.image(image, rotation)

#     # Set refresh interval (display + logic).
#     time.sleep(0.05)
