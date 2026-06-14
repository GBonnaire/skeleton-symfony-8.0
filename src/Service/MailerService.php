<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use SymfonyCasts\Bundle\ResetPassword\Model\ResetPasswordToken;

class MailerService
{
    public function __construct(
        #[Autowire('%mailer%')]
        private array $config,
        private readonly MailerInterface $mailer,
    ) {
    }

    /**
     * Envoie un email avec un lien de réinitialisation de mot de passe.
     */
    public function sendRegistration(User $user, ?string $password = null): bool
    {
        $subject = 'Confirmation de votre inscription';

        return $this->send($user->getEmail(), $subject, 'registration-confirmation', [
            'account_email' => $user->getEmail(),
            'account_password' => $user->getPlainPassword() ?? $password ?? '-- transmis par un autre moyen --',
        ]);
    }

    /**
     * Envoie un email avec un lien de réinitialisation de mot de passe.
     */
    public function sendResetPasswordLink(User $user, ResetPasswordToken $resetToken): bool
    {
        $subject = 'Réinitialisation de votre mot de passe';

        return $this->send($user->getEmail(), $subject, 'reset-password-link', [
            'user' => $user,
            'resetToken' => $resetToken,
        ]);
    }

    /**
     * Génère un email à partir d'un template Twig.
     */
    public function getTemplate($recipient, $subject, $template, $context = [], $replyTo = null): TemplatedEmail
    {
        $email = new TemplatedEmail();
        $email->from(new Address($this->config['fromEmail'], $this->config['fromName']));
        $email->to($recipient);
        if ($replyTo) {
            $email->replyTo($replyTo);
        }

        $email->subject($subject);

        $templateUrl = \sprintf('%s%s.html.twig', $this->config['templateFolder'], $template);
        $email->htmlTemplate($templateUrl);
        $email->context($context);

        return $email;
    }

    private function send($recipient, $subject, $template, $context = [], $replyTo = null, array $attachments = []): bool
    {
        $email = $this->getTemplate($recipient, $subject, $template, $context, $replyTo);
        if (\count($attachments) > 0) {
            foreach ($attachments as $attachment) {
                $email->attachFromPath($attachment);
            }
        }
        try {
            $this->mailer->send($email);

            return true;
        } catch (TransportExceptionInterface $e) {
            return false;
        }
    }
}
