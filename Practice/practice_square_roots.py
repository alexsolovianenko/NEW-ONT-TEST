# practice my square roots

from random import randint
correct = 0
question = 0
unique = []
wrong = []
while True:
    numb = randint(1,36)
    while True:
        if numb not in unique:
            unique.append(numb)
            break
        else:
            numb = randint(1,36)
            continue

    user_enter = input(f'What is the square root of {numb}:   ')
    if user_enter.lower() == 'q' or user_enter.lower() == 'quit':
        print(f'You have quit. Total correct is {correct}/{question}')
        print('Your wrong answers are:', wrong)
        quit()

    try:
        user_enter = int(user_enter)
    except ValueError:
        continue

    if user_enter == int(numb ** 2):
        print('Correct')
        correct += 1
        question += 1
    else:
        print(f'WRONG! The correct answer is {int(numb ** 2)}' + '\n')
        question += 1
        wrong.append(numb)