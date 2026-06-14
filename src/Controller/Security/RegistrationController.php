<?php

declare(strict_types=1);

namespace App\Controller\Security;

use App\Entity\User;
use App\Form\Type\Security\RegistrationFormType;
use App\Service\MailerService;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class RegistrationController extends AbstractController
{
    public function __construct(
        private readonly UserService $userService,
        private readonly MailerService $mailerService,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('/register', name: 'app_register')]
    public function register(
        Request $request,
        Security $security,
        TranslatorInterface $translator,
    ): Response {
        // Si l'utilisateur est déjà connecté, le rediriger
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Récupérer le mot de passe en clair
            $plainPassword = $form->get('plainPassword')->getData();

            // Créer l'utilisateur via le UserService
            $this->userService->createUser($user, $plainPassword);
            $this->entityManager->flush();

            $this->mailerService->sendRegistration($user, $plainPassword);

            // Message de succès
            $this->addFlash(
                'success',
                $translator->trans('registration.success', [], 'flash')
            );

            // Authenticate user
            return $security->login($user, 'form_login');
        }

        return $this->render('pages/security/register.html.twig', [
            'form' => $form,
        ]);
    }
}
