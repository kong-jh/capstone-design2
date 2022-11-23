import sys

def echo(year, month, date, day, time):
    print(year, month, date, day, time)


if __name__ == '__main__':
    echo(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
