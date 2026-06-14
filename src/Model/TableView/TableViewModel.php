<?php

namespace App\Model\TableView;

use Symfony\Contracts\Translation\TranslatorInterface;

class TableViewModel
{
    public const COLUMN_TYPE_NUMERIC = 'numeric';
    public const COLUMN_TYPE_TEXT = 'html';
    public const COLUMN_TYPE_DATE = 'date';

    public const COLUMN_ORDER_ASC = 'asc';
    public const COLUMN_ORDER_DESC = 'desc';

    private array $columnsDef = [];

    private ?TranslatorInterface $translator = null;
    private string $translationDomain = '';

    /* @var TableViewRowModel[] */
    private array $rows = [];

    private bool $showColumnActions = false;
    private bool $activeModeResponsive = false;

    private array $options = [];

    public function setTranslator(TranslatorInterface $translator, string $domain): self
    {
        $this->translator = $translator;
        $this->translationDomain = $domain;

        return $this;
    }

    public function addRow(TableViewRowModel $row): self
    {
        $this->rows[] = $row;

        return $this;
    }

    public function addRows(array $rows): self
    {
        foreach ($rows as $row) {
            if ($row instanceof TableViewRowModel) {
                $this->addRow($row);
            }
        }

        return $this;
    }

    public function reverseRows(): void
    {
        $this->rows = array_reverse($this->rows);
    }

    public function addColumn(string $fieldName, string $label, string $class = '', string $type = self::COLUMN_TYPE_TEXT, ?string $order = null, ?string $width = null, ?string $tooltip = null, ?int $responsivePriority = null): self
    {
        if ($this->translator && $this->translationDomain) {
            $label = $this->translator->trans($label, [], $this->translationDomain);
            $tooltip = $this->translator->trans($tooltip, [], $this->translationDomain);
        }

        $this->columnsDef[$fieldName] = [
            'name' => $fieldName,
            'data' => ['_' => $fieldName, 'sort' => '__' . $fieldName . '_SORT', 'class' => '__' . $fieldName . '_CLASS'],
            'type' => $type,
            'title' => $label,
            'class' => $class,
            'className' => $class,
            'tooltip' => $tooltip,
        ];

        if (null !== $responsivePriority) {
            $this->columnsDef[$fieldName]['responsivePriority'] = $responsivePriority;
        }

        if (null !== $order) {
            if (!array_key_exists('order', $this->options)) {
                $this->options['order'] = [];
            }
            $this->options['order'][] = ['name' => $fieldName, 'dir' => $order];
        }

        if (null !== $width) {
            $this->options['width'] = $width;
        }

        return $this;
    }

    public function setShowColumnActions(bool $show): self
    {
        $this->showColumnActions = $show;

        return $this;
    }

    public function setActiveModeResponsive(bool $activeModeResponsive): self
    {
        $this->activeModeResponsive = $activeModeResponsive;

        return $this;
    }

    public function sortColumnsPerFieldnames(array $orderFieldnames): self
    {
        uksort($this->columnsDef, function ($a, $b) use ($orderFieldnames) {
            $indexA = array_search($a, $orderFieldnames);
            $indexB = array_search($b, $orderFieldnames);
            if (false !== $indexA && false !== $indexB) {
                return $indexA <=> $indexB;
            }

            return strcmp($a, $b);
        });

        return $this;
    }

    /**
     * @return mixed[]
     */
    public function toArray(): array
    {
        $data = [];

        foreach ($this->rows as $row) {
            $rowArray = $row->toArray($this->columnsDef);

            $rowArray['__RESPONSIVE'] = '';

            if (array_key_exists('__ACTIONS', $rowArray)) {
                $this->showColumnActions = true;
            }

            $data[] = $rowArray;
        }

        if ($this->showColumnActions) {
            if ($this->translator && $this->translationDomain) {
                $actionLabel = $this->translator->trans('Action', [], $this->translationDomain);
            } else {
                $actionLabel = 'Action';
            }
            $this->columnsDef['__ACTIONS'] = [
                'data' => ['_' => '__ACTIONS'],
                'type' => 'html',
                'title' => $actionLabel,
                'class' => 'actions',
                'width' => '30px',
                'responsivePriority' => 1,
            ];
        }

        if ($this->activeModeResponsive) {
            $colResponsive = [
                'data' => ['_' => '__RESPONSIVE'],
                'visible' => false,
                'orderable' => false,
                'width' => '30px',
                'class' => 'col-responsive',
                'responsivePriority' => 1,
            ];

            $columns = array_merge([$colResponsive], array_values($this->columnsDef));
        } else {
            $columns = array_values($this->columnsDef);
        }

        return array_merge($this->options, [
            'columns' => $columns,
            'data' => $data,
        ]);
    }
}
