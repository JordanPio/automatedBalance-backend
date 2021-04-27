


pagasTabelas
select conta, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal 
from pagas 
where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
group by conta order by total desc;

select conta, descricao, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal 
from pagas 
where datapagamento >='2021-01-06' and datapagamento <='2021-03-18' 
and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' 
group by conta, descricao order by total desc;

-- check what is coming in

select conta, descricao, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal 
    from pagas 
    where datapagamento >='2021-03-18' and datapagamento <='2021-04-18' 
    and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' and conta not ilike '%Imposto%' and conta not ilike '%Devolu%' 
    and conta not ilike '%Frete%' and conta not ilike '%Mercado Livre%' and conta not ilike '%Diferen%' 
    and descricao not ilike '%B2W%' and descricao not ilike '%MAGAZINE LUIZA%' and descricao not ilike '%MERCADO LIVRE%' 
    group by conta, descricao order by conta, descricao asc

--new
select 
conta, descricao, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal,

CASE
WHEN "conta" ilike '%comiss%' and descricao ilike '%b2w%' THEN 'Taxas B2W'
WHEN "conta" ilike '%devolu%' and descricao ilike '%b2w%' THEN 'Devolucao B2W'
WHEN "conta" ilike '%frete%' and descricao ilike '%b2w%' THEN 'Frete B2W'

WHEN "conta" ilike '%devolu%' and descricao ilike '%magazine%' THEN 'Devolucao Magazine'
WHEN "conta" ilike '%comiss%' and descricao ilike '%magazine%' THEN 'Taxas Magazine'
WHEN "conta" ilike '%frete%' and descricao ilike '%magazine%' THEN 'Frete Magazine'

WHEN "conta" ilike '%devolu%' and descricao ilike '%Mercado%' THEN 'Devolucao Mercado Livre'
WHEN ("conta" ilike '%comiss%' or "conta" ilike '%Tarifas Banc%') and descricao ilike '%Mercado%' THEN 'Taxas Mercado Livre'
WHEN "conta" ilike '%frete%' and descricao ilike '%Mercado%' THEN 'Frete Mercado Livre'
ELSE '-'
END AS "custom" 

from pagas 
where datapagamento >='2021-01-06' and datapagamento <='2021-03-18' 
and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' 
group by conta, descricao order by conta, descricao asc;



--pgasTest

select 
    conta, descricao, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal,
    
    CASE
    WHEN "conta" ilike '%comiss%' and descricao ilike '%b2w%' THEN 'Taxas B2W'
    WHEN "conta" ilike '%devolu%' and descricao ilike '%b2w%' THEN 'Devolucao B2W'
    WHEN "conta" ilike '%dif%' and descricao ilike '%b2w%' THEN 'Devolucao B2W'
    WHEN "conta" ilike '%frete%' and descricao ilike '%b2w%' THEN 'Frete B2W'
    
    WHEN "conta" ilike '%devolu%' and descricao ilike '%magazine%' THEN 'Devolucao Magazine'
    WHEN "conta" ilike '%dif%' and descricao ilike '%magazine%' THEN 'Devolucao Magazine'
    WHEN "conta" ilike '%comiss%' and descricao ilike '%magazine%' THEN 'Taxas Magazine'
    WHEN "conta" ilike '%frete%' and descricao ilike '%magazine%' THEN 'Frete Magazine'
    
    WHEN "conta" ilike '%devolu%' and descricao ilike '%Mercado%' THEN 'Devolucao Mercado Livre'
    WHEN "conta" ilike '%dif%' and descricao ilike '%Mercado%' THEN 'Devolucao Mercado Livre'
    WHEN ("conta" ilike '%comiss%' or "conta" ilike '%Tarifas Banc%') and descricao ilike '%Mercado%' THEN 'Taxas Mercado Livre'
    WHEN "conta" ilike '%frete%' and descricao ilike '%Mercado%' THEN 'Frete Mercado Livre'
    ELSE '-'
    END AS "custom" 
    
    from pagas 
    where datapagamento >='$2021-07-29' and datapagamento <='2021-01-06' 
    and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' 
    group by conta, descricao order by conta, descricao asc



pagasDRE

select conta, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal 
from pagas 
where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' and conta not ilike '%Imposto%' and conta not ilike '%Devolu%' 
and conta not ilike '%Frete%' and conta not ilike '%Mercado Livre%' and conta not ilike '%Difere%' and conta not ilike '%Diferen%' 
and descricao not ilike '%B2W%' and descricao not ilike '%MAGAZINE LUIZA%' and descricao not ilike '%MERCADO LIVRE%' 
group by conta order by total desc;

select conta, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal 
from pagas 
where datapagamento >='2021-01-06' and datapagamento <='2021-03-18' 
and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' and conta not ilike '%Imposto%' and conta not ilike '%Devolu%' 
and conta not ilike '%Frete%' and conta not ilike '%Mercado Livre%' and conta not ilike '%Difere%' and conta not ilike '%Diferen%' 
and descricao not ilike '%B2W%' and descricao not ilike '%MAGAZINE LUIZA%' and descricao not ilike '%MERCADO LIVRE%' 
group by conta order by total desc;


Devolucoes
select descricao, sum(pago) as total from pagas 
where datapagamento >='2021-01-06' and datapagamento <='2021-03-18' 
and (conta ilike '%Dif%' or conta ilike '%Devolu%')
group by descricao 
order by total desc;


select descricao, sum(pago) as total from pagas 
where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
and (conta ilike '%Dif%' or conta ilike '%Devolu%')
group by descricao 
order by total desc;


select descricao, sum(pago) as total from pagas 
where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
and conta like '%Dif%' group by descricao order by total desc

--devolucoes check

select conta, descricao, sum(pago) as total from pagas 
    where datapagamento >='2021-01-06' and datapagamento <='2021-03-18'
    and (conta ilike '%Dif%' or conta ilike '%Devolu%')
    group by conta, descricao 
    order by conta, descricao asc;


    select sum(pago) as total from pagas 
    where datapagamento >='2021-01-06' and datapagamento <='2021-03-18'
    and (conta ilike '%Dif%' or conta ilike '%Devolu%');