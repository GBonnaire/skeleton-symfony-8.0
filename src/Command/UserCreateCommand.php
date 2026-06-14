<?php

declare(strict_types=1);

namespace App\Command;

use App\Entity\User;
use App\Service\MailerService;
use App\Service\UserService;
use App\Util\Helpers;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsCommand(name: 'app:user:create', description: 'Create user')]
class UserCreateCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator,
        private UserService $userService,
        private MailerService $mailerService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $user = new User();

        // Email
        $email = $io->ask('Email of user');
        $user->setEmail($email);

        $password = Helpers\Password::generatePassword();
        $password = $io->ask('Password of user', $password);

        $this->userService->createUser($user, $password);

        $errors = $this->validator->validate($user);
        if (\count($errors) > 0) {
            $io->error($errors->__toString());

            return Command::FAILURE;
        }

        $this->entityManager->flush();

        $this->mailerService->sendRegistration($user, $password);

        $io->success("L'utilisateur a été créé avec succès");
        $io->info('Login : ' . $user->getEmail());
        $io->info('Password : ' . $password);

        return Command::SUCCESS;
    }
}
