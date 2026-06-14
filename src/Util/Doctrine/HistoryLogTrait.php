<?php

namespace App\Util\Doctrine;

use App\Model\HistoryLogModel;
use DateTime;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

trait HistoryLogTrait
{
    #[Groups('history')]
    #[ORM\Column(type: Types::JSON, nullable: true)]
    protected array $historyLog = [];

    public function addHistoryLog(string $fieldName, mixed $previousValue, mixed $newValue, string $comment = '', ?array $extra = null): self
    {
        $now = new DateTime('now');
        $history = [
            'd' => $now->format('Y-m-d H:i:s'),
            'f' => $fieldName,
            'p' => $previousValue,
            'n' => $newValue,
        ];
        if ('' != $comment) {
            $history['c'] = $comment;
        }
        if (null != $extra) {
            $history['e'] = $extra;
        }
        $this->historyLog[] = $history;

        return $this;
    }

    /**
     * @return HistoryLogModel[]
     */
    public function getHistoryLog(?string $fieldName = null): array
    {
        $history = [];
        foreach ($this->historyLog as $historyData) {
            if (null == $fieldName || $historyData['f'] === $fieldName) {
                $history[] = new HistoryLogModel($historyData);
            }
        }

        return $history;
    }

    public function getLastHistoryLog(?string $fieldName = null): ?HistoryLogModel
    {
        $historyLog = array_reverse($this->historyLog);
        foreach ($historyLog as $historyData) {
            if (null == $fieldName || $historyData['f'] === $fieldName) {
                return new HistoryLogModel($historyData);
            }
        }

        return null;
    }
}
