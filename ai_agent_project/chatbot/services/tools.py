import datetime


def get_time():
    return str(datetime.datetime.now())


def calculator(expression):
    try:
        return eval(expression)
    except Exception:
        return "Invalid expression"