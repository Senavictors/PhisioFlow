import { ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    title: 'Ative a verificação em duas etapas',
    description:
      'Acesse myaccount.google.com/security e ative a verificação em duas etapas — exigência do Google para gerar Senhas de App.',
  },
  {
    title: 'Abra "Senhas de app"',
    description:
      'Ainda em myaccount.google.com/security, abra "Senhas de app". Pode pedir para autenticar de novo.',
  },
  {
    title: 'Crie uma senha para o PhysioFlow',
    description:
      'Escolha o nome "PhysioFlow" e clique em criar. O Google vai gerar 16 caracteres em 4 grupos.',
  },
  {
    title: 'Copie e cole aqui',
    description:
      'Cole a Senha de App no campo abaixo. Você pode revogá-la a qualquer momento na conta Google.',
  },
]

export function GmailAppPasswordGuide() {
  return (
    <section className="space-y-4 rounded-[20px] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-display text-[18px] font-bold text-foreground">
            Como gerar uma Senha de App do Gmail
          </h2>
          <p className="mt-1 font-body text-[13px] text-muted-foreground">
            Use uma senha dedicada — ela pode ser revogada no Google sem afetar a senha principal da
            sua conta.
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-xl border border-border bg-background/60 p-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-[13px] font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <p className="font-body text-[13px] font-semibold text-foreground">{step.title}</p>
              <p className="mt-0.5 font-body text-[12.5px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="rounded-xl bg-warning-soft px-3 py-2 font-body text-[12px] leading-relaxed text-warning">
        A Senha de App dá acesso a enviar e-mails pela sua conta. Guarde-a como guardaria sua senha
        do Gmail — você pode revogá-la a qualquer momento na sua conta Google sem afetar a senha
        principal.
      </p>
    </section>
  )
}
