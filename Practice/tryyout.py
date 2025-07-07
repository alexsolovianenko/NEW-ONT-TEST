# practice my square roots
from random import randint
unique = []
wrong = []
correct = 0
question = 0
while True:
    numb = randint(1,36)
    while True:
        if numb not in unique:
            unique.append(numb)
            break
        else:
            numb = randint(1,36)
            continue

    user_enter = input(f'What is the square root {numb}:   ')
    if user_enter.lower() == 'q' or user_enter.lower() == 'quit':
        print(f'\nYou have quit. Total correct is {correct}/{question}' + f'\nYour wrong answers are:')
        [print(i) for i in wrong]
        print('')
        quit()
    

    try:
        user_enter = int(user_enter)
    except ValueError:
        continue

    if user_enter == (numb**2):
        print('Correct')
        correct += 1
        question += 1
    else:
        print(f'WRONG! The correct answer is {numb**2}' + '\n')
        question +=1
        wrong.append(numb)